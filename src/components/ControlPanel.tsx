import { AudioParams, BeatMode, VOLUME_MAX } from '../audio/types';

interface ControlPanelProps {
  params: AudioParams;
  onUpdate: (partial: Partial<AudioParams>) => void;
  sweepEnabled: boolean;
  onSweepEnabledChange: (enabled: boolean) => void;
  sweepFrom: number;
  sweepTo: number;
  onSweepFromChange: (v: number) => void;
  onSweepToChange: (v: number) => void;
  disabled?: boolean;
}

function formatHz(value: number): string {
  return value < 10 ? value.toFixed(1) : Math.round(value).toString();
}

export function ControlPanel({
  params,
  onUpdate,
  sweepEnabled,
  onSweepEnabledChange,
  sweepFrom,
  sweepTo,
  onSweepFromChange,
  onSweepToChange,
  disabled = false,
}: ControlPanelProps) {
  const modes: { value: BeatMode; label: string }[] = [
    { value: 'alternator', label: 'Alternator' },
    { value: 'binaural', label: 'Binaural' },
    { value: 'blend', label: 'Blend' },
  ];

  return (
    <div className="control-panel">
      <div className="control-group">
        <label className="control-label">
          Beat Frequency
          <span className="control-value">{formatHz(params.beatFrequency)} Hz</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={100}
          step={0.5}
          value={params.beatFrequency}
          disabled={disabled || sweepEnabled}
          onChange={(e) => onUpdate({ beatFrequency: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group sweep-group">
        <label className="control-label sweep-toggle">
          <input
            type="checkbox"
            checked={sweepEnabled}
            disabled={disabled}
            onChange={(e) => onSweepEnabledChange(e.target.checked)}
          />
          Frequency Sweep
        </label>
        {sweepEnabled && (
          <div className="sweep-range">
            <div className="sweep-input">
              <span>From</span>
              <input
                type="number"
                min={0.5}
                max={99}
                step={0.5}
                value={sweepFrom}
                disabled={disabled}
                onChange={(e) => onSweepFromChange(parseFloat(e.target.value))}
              />
              <span>Hz</span>
            </div>
            <span className="sweep-arrow">→</span>
            <div className="sweep-input">
              <span>To</span>
              <input
                type="number"
                min={1}
                max={100}
                step={0.5}
                value={sweepTo}
                disabled={disabled}
                onChange={(e) => onSweepToChange(parseFloat(e.target.value))}
              />
              <span>Hz</span>
            </div>
          </div>
        )}
      </div>

      <div className="control-group">
        <label className="control-label">
          Beat Difference (Binaural)
          <span className="control-value">{formatHz(params.beatDifference)} Hz</span>
        </label>
        <input
          type="range"
          min={0.5}
          max={40}
          step={0.5}
          value={params.beatDifference}
          disabled={disabled}
          onChange={(e) => onUpdate({ beatDifference: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label className="control-label">
          Carrier Frequency
          <span className="control-value">{Math.round(params.carrierFrequency)} Hz</span>
        </label>
        <input
          type="range"
          min={80}
          max={300}
          step={1}
          value={params.carrierFrequency}
          disabled={disabled}
          onChange={(e) => onUpdate({ carrierFrequency: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Audio Mode</label>
        <div className="mode-toggle">
          {modes.map((mode) => (
            <button
              key={mode.value}
              className={`mode-btn ${params.mode === mode.value ? 'active' : ''}`}
              disabled={disabled}
              onClick={() => onUpdate({ mode: mode.value })}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {params.mode === 'blend' && (
        <div className="control-group">
          <label className="control-label">
            Alternator Blend
            <span className="control-value">{Math.round(params.alternatorBlend * 100)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={params.alternatorBlend}
            disabled={disabled}
            onChange={(e) => onUpdate({ alternatorBlend: parseFloat(e.target.value) })}
          />
        </div>
      )}

      <div className="control-group">
        <label className="control-label">
          Volume
          <span className="control-value">{Math.round(params.volume * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={VOLUME_MAX}
          step={0.01}
          value={params.volume}
          onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
        />
      </div>

      <div className="control-group">
        <label className="control-label resonance-toggle">
          <input
            type="checkbox"
            checked={params.resonanceEnabled}
            disabled={disabled}
            onChange={(e) => onUpdate({ resonanceEnabled: e.target.checked })}
          />
          Resonant Tuning (7.83 Hz Schumann)
        </label>
      </div>
    </div>
  );
}
