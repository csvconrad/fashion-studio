import { getStroke } from 'perfect-freehand';
import type { Canvas as FabricCanvas } from 'fabric';
import { Path } from 'fabric';
import type { BrushDef } from './brushData';

// ─── Types ───────────────────────────────────────────────────────────

interface Point {
  x: number;
  y: number;
  pressure?: number;
}

// ─── SVG path from perfect-freehand points ───────────────────────────

function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d: string[] = [];
  const [first, ...rest] = stroke;

  d.push(`M ${first[0].toFixed(2)},${first[1].toFixed(2)}`);

  for (let i = 0; i < rest.length; i++) {
    const [x, y] = rest[i];
    if (i < rest.length - 1) {
      const [nx, ny] = rest[i + 1];
      const mx = ((x + nx) / 2).toFixed(2);
      const my = ((y + ny) / 2).toFixed(2);
      d.push(`Q ${x.toFixed(2)},${y.toFixed(2)} ${mx},${my}`);
    } else {
      d.push(`L ${x.toFixed(2)},${y.toFixed(2)}`);
    }
  }

  d.push('Z');
  return d.join(' ');
}

// ─── Brush Engine ────────────────────────────────────────────────────

export class BrushEngine {
  private canvas: FabricCanvas;
  private points: Point[] = [];
  private isDrawing = false;
  private brush: BrushDef;
  private color: string;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private sizeOverride: number | null = null;
  private opacityOverride: number | null = null;

  // Callbacks
  onStrokeComplete?: (path: Path) => void;

  constructor(canvas: FabricCanvas, brush: BrushDef, color: string) {
    this.canvas = canvas;
    this.brush = brush;
    this.color = color;
  }

  setBrush(brush: BrushDef) { this.brush = brush; }
  setColor(color: string) { this.color = color; }
  setSize(size: number) { this.sizeOverride = size; }
  setOpacity(opacity: number) { this.opacityOverride = opacity; }

  get currentSize(): number { return this.sizeOverride ?? this.brush.size; }
  get currentOpacity(): number { return this.opacityOverride ?? this.brush.opacity; }

  // ── Pointer handlers (called from DesignCanvas) ──

  onPointerDown(x: number, y: number, pressure = 0.5) {
    this.isDrawing = true;
    this.points = [{ x, y, pressure }];
    this._setupPreview();
    this._renderPreview();
  }

  onPointerMove(x: number, y: number, pressure = 0.5) {
    if (!this.isDrawing) return;

    // Add jitter
    const jx = x + (Math.random() - 0.5) * this.brush.jitter * 2;
    const jy = y + (Math.random() - 0.5) * this.brush.jitter * 2;

    this.points.push({ x: jx, y: jy, pressure });

    if (this.brush.style === 'spray') {
      this._renderSprayAt(jx, jy);
    } else {
      this._renderPreview();
    }
  }

  onPointerUp() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this._clearPreview();

    if (this.points.length < 2) return;

    if (this.brush.style === 'spray') {
      this._finalizeSpray();
    } else {
      this._finalizeStroke();
    }
  }

  // ── Preview rendering (on a top canvas) ──

  private _setupPreview() {
    // Use the Fabric.js upper canvas for live preview
    const upper = this.canvas.getSelectionElement();
    if (upper) {
      this.previewCtx = upper.getContext('2d');
    }
  }

  private _clearPreview() {
    if (this.previewCtx) {
      const el = this.previewCtx.canvas;
      this.previewCtx.clearRect(0, 0, el.width, el.height);
      this.previewCtx = null;
    }
  }

  private _renderPreview() {
    if (!this.previewCtx || this.points.length < 2) return;
    const ctx = this.previewCtx;
    const el = ctx.canvas;
    ctx.clearRect(0, 0, el.width, el.height);

    ctx.save();
    ctx.globalAlpha = this.currentOpacity;
    ctx.globalCompositeOperation = this.brush.compositeOp;

    if (this.brush.style === 'glow') {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.brush.glowRadius;
    }

    const stroke = this._getStrokeOutline();
    const pathStr = getSvgPathFromStroke(stroke);
    const path2d = new Path2D(pathStr);
    ctx.fillStyle = this.color;
    ctx.fill(path2d);

    ctx.restore();
  }

  private _renderSprayAt(x: number, y: number) {
    if (!this.previewCtx) return;
    const ctx = this.previewCtx;
    const radius = this.currentSize / 2;

    ctx.save();
    ctx.globalAlpha = this.currentOpacity * 0.3;
    ctx.fillStyle = this.color;

    for (let i = 0; i < this.brush.dotCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const dotSize = 0.5 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── Finalize: create Fabric Path from stroke ──

  private _finalizeStroke() {
    const stroke = this._getStrokeOutline();
    const pathStr = getSvgPathFromStroke(stroke);
    if (!pathStr) return;

    const path = new Path(pathStr, {
      fill: this.brush.compositeOp === 'destination-out' ? '#000000' : this.color,
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: this.currentOpacity,
      globalCompositeOperation: this.brush.compositeOp,
      selectable: true,
      evented: true,
    });

    // Apply glow effect via shadow
    if (this.brush.style === 'glow') {
      import('fabric').then(({ Shadow }) => {
        path.shadow = new Shadow({
          color: this.color,
          blur: this.brush.glowRadius,
          offsetX: 0,
          offsetY: 0,
        });
        this.canvas.renderAll();
      });
    }

    this.canvas.add(path);
    this.canvas.renderAll();
    this.onStrokeComplete?.(path);
  }

  private _finalizeSpray() {
    // Convert spray preview to a rasterized image on canvas
    // For simplicity, we collect all spray points and create individual tiny circles as a group
    if (!this.previewCtx) return;

    // Capture the preview as a dataURL and add as image
    const el = this.previewCtx.canvas;
    const dataUrl = el.toDataURL('image/png');

    // Use fabric.Image to add the spray result
    import('fabric').then(({ FabricImage }) => {
      FabricImage.fromURL(dataUrl).then((img) => {
        img.set({
          left: 0,
          top: 0,
          selectable: true,
          evented: true,
        });
        this.canvas.add(img);
        this.canvas.renderAll();
        this.onStrokeComplete?.(img as unknown as Path);
      });
    });
  }

  // ── perfect-freehand stroke generation ──

  private _getStrokeOutline(): number[][] {
    const inputPoints = this.points.map((p) => [p.x, p.y, p.pressure ?? 0.5]);

    return getStroke(inputPoints, {
      size: this.currentSize,
      thinning: this.brush.thinning,
      smoothing: this.brush.smoothing,
      streamline: this.brush.streamline,
      start: { taper: this.brush.taperStart },
      end: { taper: this.brush.taperEnd },
      simulatePressure: !this.points.some((p) => p.pressure !== undefined && p.pressure !== 0.5),
    });
  }

  // ── Static: render a preview stroke for the BrushPanel ──

  static renderPreviewStroke(
    ctx: CanvasRenderingContext2D,
    brush: BrushDef,
    color: string,
    width: number,
    height: number,
    sizeOverride?: number,
    opacityOverride?: number,
  ) {
    ctx.clearRect(0, 0, width, height);

    const size = sizeOverride ?? brush.size;
    const opacity = opacityOverride ?? brush.opacity;

    // Generate a sample wave stroke
    const points: number[][] = [];
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = t * width * 0.8 + width * 0.1;
      const y = height / 2 + Math.sin(t * Math.PI * 2) * height * 0.25;
      const pressure = 0.3 + Math.sin(t * Math.PI) * 0.5;
      points.push([x, y, pressure]);
    }

    if (brush.style === 'spray') {
      ctx.save();
      ctx.globalAlpha = opacity * 0.4;
      ctx.fillStyle = color;
      for (const [px, py] of points) {
        for (let i = 0; i < Math.max(3, brush.dotCount / 3); i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * size * 0.4;
          ctx.beginPath();
          ctx.arc(px + Math.cos(angle) * dist, py + Math.sin(angle) * dist, 0.5 + Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return;
    }

    const stroke = getStroke(points, {
      size,
      thinning: brush.thinning,
      smoothing: brush.smoothing,
      streamline: brush.streamline,
      start: { taper: brush.taperStart },
      end: { taper: brush.taperEnd },
      simulatePressure: true,
    });

    const pathStr = getSvgPathFromStroke(stroke);
    if (!pathStr) return;

    ctx.save();
    ctx.globalAlpha = opacity;

    if (brush.style === 'glow') {
      ctx.shadowColor = color;
      ctx.shadowBlur = brush.glowRadius;
    }

    const path2d = new Path2D(pathStr);
    ctx.fillStyle = color;
    ctx.fill(path2d);
    ctx.restore();
  }
}
