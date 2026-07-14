import { SessionDefinition } from '../audio/types';
import { CUSTOM_PRESET, PRESETS } from '../session/presets';

const ALL_PRESETS = [...PRESETS, CUSTOM_PRESET];

interface PresetSelectorProps {
  selectedId: string;
  onSelect: (preset: SessionDefinition) => void;
  disabled?: boolean;
}

function formatDuration(phases: SessionDefinition['phases']): string {
  const totalSec = phases.reduce((sum, p) => sum + p.durationSec, 0);
  const min = Math.round(totalSec / 60);
  return `~${min} min`;
}

export function PresetSelector({ selectedId, onSelect, disabled }: PresetSelectorProps) {
  return (
    <div className="preset-selector">
      <h3 className="section-title">Focus Levels</h3>
      <div className="preset-grid">
        {ALL_PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`preset-card ${selectedId === preset.id ? 'selected' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(preset)}
          >
            <div className="preset-name">{preset.name}</div>
            <div className="preset-band">{preset.targetBand}</div>
            <div className="preset-desc">{preset.description}</div>
            {preset.phases.length > 0 && (
              <div className="preset-duration">{formatDuration(preset.phases)}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
