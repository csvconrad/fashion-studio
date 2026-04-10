import { useState, useEffect } from 'react';

const SEEN_KEY = 'fashion-studio-onboarding-seen';

interface Step {
  title: string;
  desc: string;
  icon: string;
}

const steps: Step[] = [
  { title: 'Bienvenue !', desc: 'Choisis un gabarit de vetement dans le panneau de droite, ou commence un dessin libre.', icon: '\u{1F3A8}' },
  { title: 'Outils creatifs', desc: 'Utilise la barre a gauche : pinceau, texte, formes, stickers, images. Raccourci : tape B, T, S, I.', icon: '\u270F\uFE0F' },
  { title: 'Couleurs & effets', desc: 'Clique sur un element puis choisis une couleur. Le panneau de droite montre les effets disponibles.', icon: '\u{1F308}' },
  { title: 'Calques', desc: 'Passe en mode Pro pour voir les calques. Chaque element est sur un calque que tu peux reordonner.', icon: '\u{1F4DA}' },
  { title: 'Sauvegarde', desc: 'Ctrl+S pour sauvegarder. L\'app sauvegarde aussi automatiquement toutes les 30 secondes.', icon: '\u{1F4BE}' },
];

export default function Onboarding() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(SEEN_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(SEEN_KEY, '1');
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else dismiss();
  };

  if (!visible) return null;

  const s = steps[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[360px] bg-[#1e1e2e] rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-4">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-purple-500' : i < step ? 'bg-purple-500/40' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-5xl mb-4">{s.icon}</div>
          <h2 className="text-lg font-bold text-white mb-2">{s.title}</h2>
          <p className="text-sm text-white/50 leading-relaxed">{s.desc}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-white/5">
          <button onClick={dismiss} className="flex-1 py-2 rounded-xl text-sm text-white/30 hover:text-white/50 transition-colors">
            Passer
          </button>
          <button onClick={next} className="flex-1 py-2 rounded-xl text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 transition-colors">
            {step < steps.length - 1 ? 'Suivant' : 'Commencer !'}
          </button>
        </div>
      </div>
    </div>
  );
}
