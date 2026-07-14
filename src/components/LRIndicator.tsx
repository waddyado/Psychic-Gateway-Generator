import { SideIndicator } from '../audio/types';

interface LRIndicatorProps {
  currentSide: SideIndicator;
  beatHz: number;
  isPlaying: boolean;
}

const DOT_COUNT = 7;

export function LRIndicator({ currentSide, beatHz, isPlaying }: LRIndicatorProps) {
  const leftActive = isPlaying && (currentSide === 'left' || currentSide === 'both');
  const rightActive = isPlaying && (currentSide === 'right' || currentSide === 'both');

  const blinkStyle = beatHz > 0 && isPlaying
    ? { animationDuration: `${Math.max(0.15, 1 / beatHz)}s` }
    : undefined;

  return (
    <div className="lr-indicator">
      <div className={`lr-side lr-left ${leftActive ? 'active' : ''}`} style={blinkStyle}>
        <span className="lr-label">L</span>
        <div className="lr-dots">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <div
              key={`l-${i}`}
              className={`lr-dot ${leftActive ? 'lit' : ''}`}
              style={{ animationDelay: `${i * 0.05}s`, ...blinkStyle }}
            />
          ))}
        </div>
      </div>

      <div className="lr-divider">
        <div className={`lr-pulse ${isPlaying ? 'pulsing' : ''}`} style={blinkStyle} />
      </div>

      <div className={`lr-side lr-right ${rightActive ? 'active' : ''}`} style={blinkStyle}>
        <div className="lr-dots">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <div
              key={`r-${i}`}
              className={`lr-dot ${rightActive ? 'lit' : ''}`}
              style={{ animationDelay: `${i * 0.05}s`, ...blinkStyle }}
            />
          ))}
        </div>
        <span className="lr-label">R</span>
      </div>
    </div>
  );
}
