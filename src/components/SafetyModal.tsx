import { useState } from 'react';

const STORAGE_KEY = 'pga-safety-acknowledged';

interface SafetyModalProps {
  onAcknowledge: () => void;
}

export function SafetyModal({ onAcknowledge }: SafetyModalProps) {
  const [checked, setChecked] = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    localStorage.setItem(STORAGE_KEY, 'true');
    onAcknowledge();
  };

  return (
    <div className="safety-overlay">
      <div className="safety-modal">
        <div className="safety-icon">⚠</div>
        <h2 className="safety-title">Before You Begin</h2>
        <p className="safety-subtitle">
          Psychic Gateway Alternator uses powerful audio entrainment techniques.
          Please read carefully.
        </p>

        <ul className="safety-list">
          <li>
            <strong>Headphones required.</strong> Stereo separation is essential for
            binaural beats and alternating panning effects.
          </li>
          <li>
            <strong>Keep volume low.</strong> Start at 30% and increase gradually.
            Loud frequencies can cause discomfort or hearing damage.
          </li>
          <li>
            <strong>Do not use while driving</strong> or operating machinery. These
            sessions induce altered states of consciousness.
          </li>
          <li>
            <strong>Epilepsy / seizure warning.</strong> Rapid frequency changes and
            flickering visuals may affect photosensitive individuals.
          </li>
          <li>
            <strong>Not medical advice.</strong> This app is for meditation and personal
            exploration only. Consult a physician if you have health concerns.
          </li>
        </ul>

        <label className="safety-checkbox">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>I understand and will use headphones at a safe volume</span>
        </label>

        <button
          className="safety-accept-btn"
          disabled={!checked}
          onClick={handleAccept}
        >
          Enter the Gateway
        </button>
      </div>
    </div>
  );
}

export function useSafetyAcknowledged(): [boolean, () => void] {
  const [acknowledged, setAcknowledged] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const acknowledge = () => setAcknowledged(true);

  return [acknowledged, acknowledge];
}

export function SafetyBadge() {
  return (
    <div className="safety-badge">
      <span className="safety-badge-icon">🎧</span>
      Headphones Required
    </div>
  );
}
