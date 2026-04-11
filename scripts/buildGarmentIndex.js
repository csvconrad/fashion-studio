#!/usr/bin/env node
// ─── Build garment library index ─────────────────────────────────────
// Scans /public/garments/library/, generates thumbnails and index.json
// Usage: node scripts/buildGarmentIndex.js [--rebuild]

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, relative, basename, extname } from 'path';
import { createHash } from 'crypto';
import sharp from 'sharp';

const ROOT = join(import.meta.dirname, '..', 'public', 'garments', 'library');
const THUMB_DIR = join(import.meta.dirname, '..', 'public', 'garments', 'thumbnails');
const INDEX_PATH = join(import.meta.dirname, '..', 'public', 'garments', 'index.json');
const REBUILD = process.argv.includes('--rebuild');

// ─── Family mapping ──────────────────────────────────────────────────

const FAMILY_MAP = {
  tops: {
    label: 'Tops',
    categories: [
      'Tees', 'Crop Tops', 'Cropped Tees', 'Tank Tops', 'Shoulder Tops',
      'Shoulder Crop Tops', 'Long Sleeve Tees', 'Long Sleeve 2 in 1', 'Sleeve Tee',
      'Double Sleeve Tees', 'Denim T-Shirts', 'Turtleneck', 'Shirt', 'Shirt Blouses',
      'Long Blouse', 'Lounge Shirts',
    ],
  },
  outerwear: {
    label: 'Outerwear',
    categories: [
      'Hoodies', 'Oversized Hoodies', 'Zip Hoodie', 'Sweaters', 'Sweats',
      'Cardigans', 'Blazers', 'Jackets', 'Boomber Jackets', 'Denim Jacket',
      'Puffer Jackets', 'Technical Jacket', 'Vests', 'Gillets', 'Outer', 'Sleeve Knitted',
    ],
  },
  bottoms: {
    label: 'Bottoms',
    categories: [
      'Jeans', 'Jorts', 'Cargos', 'Shorts', 'Biker Shorts', 'Leggings',
      'Flared Trousers', 'Skirts', 'Jean Skirts',
    ],
  },
  'dresses-sets': {
    label: 'Dresses & Sets',
    categories: ['Dresses', 'Womens clothing', 'Piyama'],
  },
  footwear: {
    label: 'Footwear',
    categories: ['Shoes', 'Sneakers', 'Soles', 'Shoelaces'],
  },
  'accessories-details': {
    label: 'Accessories & Details',
    categories: [
      'Accessories', 'Activewear', 'Bags', 'Backpacks', 'Hats', 'Beanies',
      'Balaclavas', 'Cowl', 'Neck', 'Collar', 'Pockets', 'Zippers', 'Labels', 'Underwear',
    ],
  },
};

// Build reverse lookup: folder name → family ID
const FOLDER_TO_FAMILY = {};
for (const [familyId, { categories }] of Object.entries(FAMILY_MAP)) {
  for (const cat of categories) {
    FOLDER_TO_FAMILY[cat] = familyId;
    // Also handle trimmed version (some folders have trailing space)
    FOLDER_TO_FAMILY[cat.trim()] = familyId;
  }
}

// Display name overrides
const DISPLAY_OVERRIDES = {
  'Boomber Jackets': 'Bomber Jackets',
  'Piyama': 'Pajamas',
};

function makeId(relPath) {
  return createHash('md5').update(relPath).digest('hex').slice(0, 12);
}

function cleanName(filename) {
  return basename(filename, extname(filename))
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractViewBox(svgContent) {
  const match = svgContent.match(/viewBox=["']([^"']+)["']/);
  if (match) {
    const parts = match[1].split(/\s+/).map(Number);
    if (parts.length === 4) return { width: parts[2], height: parts[3] };
  }
  // Fallback: try width/height attributes
  const w = svgContent.match(/width=["']([0-9.]+)/);
  const h = svgContent.match(/height=["']([0-9.]+)/);
  if (w && h) return { width: parseFloat(w[1]), height: parseFloat(h[1]) };
  return { width: 400, height: 400 };
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  console.log('🔍 Scanning garment library...\n');

  const garments = [];
  const categoryMap = new Map(); // categoryId → { label, family, count }
  const familyCounts = {};
  let thumbsGenerated = 0;
  let thumbsSkipped = 0;
  let errors = 0;

  // Scan all category folders
  const folders = readdirSync(ROOT).filter(f => {
    const p = join(ROOT, f);
    return statSync(p).isDirectory();
  });

  for (const folder of folders) {
    const folderPath = join(ROOT, folder);
    const folderName = folder.trim();
    const familyId = FOLDER_TO_FAMILY[folderName] || 'accessories-details';
    const categoryId = folderName.toLowerCase().replace(/\s+/g, '-');
    const categoryLabel = DISPLAY_OVERRIDES[folderName] || folderName;

    // Get SVG files
    let svgFiles;
    try {
      svgFiles = readdirSync(folderPath).filter(f => f.toLowerCase().endsWith('.svg'));
    } catch (e) {
      console.error(`  ❌ Error reading ${folder}: ${e.message}`);
      errors++;
      continue;
    }

    if (svgFiles.length === 0) continue;

    categoryMap.set(categoryId, { label: categoryLabel, family: familyId, count: svgFiles.length });
    familyCounts[familyId] = (familyCounts[familyId] || 0) + svgFiles.length;

    for (const file of svgFiles) {
      const filePath = join(folderPath, file);
      const relPath = relative(join(ROOT, '..', '..'), filePath);
      const id = makeId(relPath);

      try {
        const svgContent = readFileSync(filePath, 'utf-8');
        const { width, height } = extractViewBox(svgContent);

        garments.push({
          id,
          name: cleanName(file),
          category: categoryId,
          categoryLabel,
          family: familyId,
          svgPath: `/garments/library/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`,
          thumbnailPath: `/garments/thumbnails/${id}.png`,
          width,
          height,
          tags: [],
        });

        // Generate thumbnail
        const thumbPath = join(THUMB_DIR, `${id}.png`);
        if (REBUILD || !existsSync(thumbPath)) {
          try {
            await sharp(Buffer.from(svgContent))
              .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
              .png()
              .toFile(thumbPath);
            thumbsGenerated++;
          } catch (e) {
            // Some SVGs may fail — skip thumbnail
            thumbsSkipped++;
          }
        } else {
          thumbsSkipped++;
        }
      } catch (e) {
        console.error(`  ❌ Error processing ${file}: ${e.message}`);
        errors++;
      }
    }

    const total = thumbsGenerated + thumbsSkipped + errors;
    process.stdout.write(`\r  Processing... ${total}/${garments.length + errors} files`);
  }

  console.log('\n');

  // Build index
  const families = Object.entries(FAMILY_MAP).map(([id, { label }]) => ({
    id,
    label,
    count: familyCounts[id] || 0,
  }));

  const categories = Array.from(categoryMap.entries()).map(([id, data]) => ({
    id,
    label: data.label,
    family: data.family,
    count: data.count,
  }));

  const index = {
    version: 1,
    generatedAt: new Date().toISOString(),
    totalCount: garments.length,
    families,
    categories: categories.sort((a, b) => a.label.localeCompare(b.label)),
    garments: garments.sort((a, b) => a.name.localeCompare(b.name)),
  };

  writeFileSync(INDEX_PATH, JSON.stringify(index));
  const indexSize = (statSync(INDEX_PATH).size / 1024).toFixed(0);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('✅ Garment library index built successfully!\n');
  console.log(`   📁 Categories:        ${categories.length}`);
  console.log(`   👕 Total garments:     ${garments.length}`);
  console.log(`   🖼️  Thumbnails created: ${thumbsGenerated}`);
  console.log(`   ⏭️  Thumbnails skipped: ${thumbsSkipped}`);
  console.log(`   ❌ Errors:             ${errors}`);
  console.log(`   📄 Index size:         ${indexSize} KB`);
  console.log(`   ⏱️  Time:              ${elapsed}s\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
