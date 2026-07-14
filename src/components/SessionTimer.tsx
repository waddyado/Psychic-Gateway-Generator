import { SessionState } from '../audio/types';

interface SessionTimerProps {
  sessionState: SessionState;
  isManualMode: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionTimer({ sessionState, isManualMode }: SessionTimerProps) {
  if (isManualMode) {
    return (
      <div className="session-timer">
        <span className="timer-label">Manual Mode</span>
        <span className="timer-value">Open Session</span>
      </div>
    );
  }

  const remaining = Math.max(0, sessionState.totalDurationSec - sessionState.elapsedSec);

  return (
    <div className="session-timer">
      {sessionState.phaseLabel && (
        <span className="timer-phase">{sessionState.phaseLabel}</span>
      )}
      <span className="timer-value">
        {formatTime(sessionState.elapsedSec)} / {formatTime(sessionState.totalDurationSec)}
      </span>
      <span className="timer-remaining">{formatTime(remaining)} remaining</span>
    </div>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{ width: `${Math.min(progress * 100, 100)}%` }}
      />
    </div>
  );
}

export function EnergyBar({ beatHz, progress }: { beatHz: number; progress: number }) {
  const intensity = Math.min(beatHz / 40, 1);
  const pulseSpeed = beatHz > 0 ? `${Math.max(0.3, 2 / beatHz)}s` : '2s';

  return (
    <div className="energy-bar-container">
      <div className="energy-bar-label">Energy Level</div>
      <div className="energy-bar">
        <div
          className="energy-fill"
          style={{
            width: `${Math.max(intensity * 100, progress * 100)}%`,
            animationDuration: pulseSpeed,
          }}
        />
      </div>
    </div>
  );
}
