import { useEffect, useRef } from 'react';

interface EnergyOrbProps {
  beatHz: number;
  isPlaying: boolean;
}

export function EnergyOrb({ beatHz, isPlaying }: EnergyOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    if (!isPlaying || beatHz <= 0) {
      orb.style.transform = 'scale(1)';
      orb.style.opacity = '0.4';
      return;
    }

    const period = 1000 / beatHz;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const phase = (elapsed % period) / period;
      const scale = 0.85 + 0.3 * Math.sin(phase * Math.PI * 2);
      const opacity = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);

      orb.style.transform = `scale(${scale})`;
      orb.style.opacity = `${opacity}`;

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [beatHz, isPlaying]);

  return (
    <div className="energy-orb-container">
      <div ref={orbRef} className="energy-orb">
        <div className="orb-core" />
        <div className="orb-ring orb-ring-1" />
        <div className="orb-ring orb-ring-2" />
        <div className="orb-ring orb-ring-3" />
      </div>
    </div>
  );
}
