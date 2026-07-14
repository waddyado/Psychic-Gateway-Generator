import { useEffect, useState } from 'react';
import { BreathingPattern } from '../audio/types';

interface BreathingGuideProps {
  pattern: BreathingPattern;
  isActive: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

const PATTERNS: Record<NonNullable<BreathingPattern>, { phase: BreathPhase; duration: number; label: string }[]> = {
  '4-7-8': [
    { phase: 'inhale', duration: 4, label: 'Inhale' },
    { phase: 'hold', duration: 7, label: 'Hold' },
    { phase: 'exhale', duration: 8, label: 'Exhale' },
  ],
  'box': [
    { phase: 'inhale', duration: 4, label: 'Inhale' },
    { phase: 'hold', duration: 4, label: 'Hold' },
    { phase: 'exhale', duration: 4, label: 'Exhale' },
    { phase: 'hold2', duration: 4, label: 'Hold' },
  ],
};

export function BreathingGuide({ pattern, isActive }: BreathingGuideProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [currentLabel, setCurrentLabel] = useState('');

  useEffect(() => {
    if (!isActive || !pattern) {
      setCurrentLabel('');
      return;
    }

    const steps = PATTERNS[pattern];
    let stepIdx = 0;
    let remaining = steps[0].duration;

    setPhaseIndex(0);
    setCountdown(remaining);
    setCurrentLabel(steps[0].label);

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        stepIdx = (stepIdx + 1) % steps.length;
        remaining = steps[stepIdx].duration;
        setPhaseIndex(stepIdx);
        setCurrentLabel(steps[stepIdx].label);
      }
      setCountdown(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [pattern, isActive]);

  if (!isActive || !pattern) return null;

  const steps = PATTERNS[pattern];
  const currentPhase = steps[phaseIndex]?.phase ?? 'inhale';

  return (
    <div className="breathing-guide">
      <div className="breathing-label">Breathing Guide</div>
      <div className={`breathing-circle ${currentPhase}`}>
        <span className="breathing-action">{currentLabel}</span>
        <span className="breathing-count">{countdown}</span>
      </div>
    </div>
  );
}
