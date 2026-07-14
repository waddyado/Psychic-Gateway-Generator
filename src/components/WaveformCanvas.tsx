import { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  getAnalyser: () => AnalyserNode | null;
  isPlaying: boolean;
}

export function WaveformCanvas({ getAnalyser, isPlaying }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const bufferLength = 2048;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;

      ctx.clearRect(0, 0, w, h);

      const analyser = getAnalyser();
      if (!analyser || !isPlaying) {
        drawIdleWave(ctx, w, h);
        return;
      }

      analyser.getByteTimeDomainData(dataArray);

      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, 'rgba(124, 111, 247, 0.8)');
      gradient.addColorStop(0.5, 'rgba(79, 209, 197, 0.9)');
      gradient.addColorStop(1, 'rgba(124, 111, 247, 0.8)');

      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(124, 111, 247, 0.5)';
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [getAnalyser, isPlaying]);

  return <canvas ref={canvasRef} className="waveform-canvas" />;
}

function drawIdleWave(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, 'rgba(124, 111, 247, 0.2)');
  gradient.addColorStop(0.5, 'rgba(79, 209, 197, 0.3)');
  gradient.addColorStop(1, 'rgba(124, 111, 247, 0.2)');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  const mid = h / 2;
  for (let x = 0; x < w; x++) {
    const y = mid + Math.sin(x * 0.02) * 8;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
