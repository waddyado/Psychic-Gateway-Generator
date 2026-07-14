import type { CSSProperties } from 'react';

interface BrainwaveBandsProps {
  currentHz: number;
}

const BANDS = [
  { name: 'Delta', range: '0.5–4', min: 0.5, max: 4, color: '#4a3f8a' },
  { name: 'Theta', range: '4–8', min: 4, max: 8, color: '#7c6ff7' },
  { name: 'Alpha', range: '8–12', min: 8, max: 12, color: '#4fd1c5' },
  { name: 'Beta', range: '12–30', min: 12, max: 30, color: '#d4a853' },
  { name: 'Gamma', range: '30+', min: 30, max: 100, color: '#e85d75' },
];

export function BrainwaveBands({ currentHz }: BrainwaveBandsProps) {
  return (
    <div className="brainwave-bands">
      {BANDS.map((band) => {
        const isActive = currentHz >= band.min && currentHz < band.max;
        const proximity = isActive
          ? 1
          : Math.max(0, 1 - Math.min(
              Math.abs(currentHz - band.min),
              Math.abs(currentHz - band.max)
            ) / 4);

        return (
          <div
            key={band.name}
            className={`band ${isActive ? 'active' : ''}`}
            style={{
              '--band-color': band.color,
              '--band-glow': `${proximity * 0.8}`,
            } as CSSProperties}
          >
            <div className="band-glow" />
            <span className="band-symbol">
              {band.name === 'Alpha' ? 'α' :
               band.name === 'Theta' ? 'θ' :
               band.name === 'Beta' ? 'β' :
               band.name === 'Gamma' ? 'γ' : 'δ'}
            </span>
            <span className="band-name">{band.name}</span>
            <span className="band-range">{band.range} Hz</span>
          </div>
        );
      })}
    </div>
  );
}
