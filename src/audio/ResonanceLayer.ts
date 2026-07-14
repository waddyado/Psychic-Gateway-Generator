const SCHUMANN_FREQ = 7.83;

export class ResonanceLayer {
  private ctx: AudioContext;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode;
  private modGain: GainNode;
  private depth = 0.08;
  private isRunning = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.lfoGain = ctx.createGain();
    this.modGain = ctx.createGain();
    this.modGain.gain.value = 1;
  }

  get input(): GainNode {
    return this.modGain;
  }

  get output(): GainNode {
    return this.modGain;
  }

  start(): void {
    if (this.isRunning) return;

    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = SCHUMANN_FREQ;

    this.lfoGain.gain.value = this.depth;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.modGain.gain);

    this.lfo.start();
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;

    try {
      this.lfo?.stop();
    } catch {
      // already stopped
    }
    this.lfo?.disconnect();
    this.lfoGain.disconnect();
    this.lfo = null;
    this.isRunning = false;

    this.modGain.gain.value = 1;
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = this.depth;
  }

  setEnabled(enabled: boolean): void {
    if (enabled && !this.isRunning) {
      this.start();
    } else if (!enabled && this.isRunning) {
      this.stop();
    }
  }

  setDepth(depth: number): void {
    this.depth = depth;
    if (this.lfoGain) {
      this.lfoGain.gain.setValueAtTime(depth, this.ctx.currentTime);
    }
  }
}
