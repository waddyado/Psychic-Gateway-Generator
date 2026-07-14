export class BinauralOscillator {
  private ctx: AudioContext;
  private leftOsc: OscillatorNode | null = null;
  private rightOsc: OscillatorNode | null = null;
  private leftGain: GainNode;
  private rightGain: GainNode;
  private merger: ChannelMergerNode;
  private outputGain: GainNode;
  private baseFreq = 100;
  private beatDiff = 6;
  private isRunning = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.leftGain = ctx.createGain();
    this.rightGain = ctx.createGain();
    this.merger = ctx.createChannelMerger(2);
    this.outputGain = ctx.createGain();

    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);
    this.merger.connect(this.outputGain);
  }

  get output(): GainNode {
    return this.outputGain;
  }

  start(): void {
    if (this.isRunning) return;

    this.leftOsc = this.ctx.createOscillator();
    this.rightOsc = this.ctx.createOscillator();
    this.leftOsc.type = 'sine';
    this.rightOsc.type = 'sine';

    this.leftOsc.frequency.value = this.baseFreq;
    this.rightOsc.frequency.value = this.baseFreq + this.beatDiff;

    this.leftOsc.connect(this.leftGain);
    this.rightOsc.connect(this.rightGain);

    this.leftOsc.start();
    this.rightOsc.start();
    this.isRunning = true;
  }

  stop(): void {
    if (!this.isRunning) return;

    try {
      this.leftOsc?.stop();
      this.rightOsc?.stop();
    } catch {
      // already stopped
    }
    this.leftOsc?.disconnect();
    this.rightOsc?.disconnect();
    this.leftOsc = null;
    this.rightOsc = null;
    this.isRunning = false;
  }

  setFrequencies(baseFreq: number, beatDiff: number): void {
    this.baseFreq = baseFreq;
    this.beatDiff = beatDiff;

    if (this.leftOsc && this.rightOsc) {
      const now = this.ctx.currentTime;
      this.leftOsc.frequency.setValueAtTime(baseFreq, now);
      this.rightOsc.frequency.setValueAtTime(baseFreq + beatDiff, now);
    }
  }

  rampFrequencies(baseFreq: number, beatDiff: number, durationSec: number): void {
    this.baseFreq = baseFreq;
    this.beatDiff = beatDiff;

    if (this.leftOsc && this.rightOsc) {
      const now = this.ctx.currentTime;
      this.leftOsc.frequency.linearRampToValueAtTime(baseFreq, now + durationSec);
      this.rightOsc.frequency.linearRampToValueAtTime(baseFreq + beatDiff, now + durationSec);
    }
  }

  setGain(value: number): void {
    this.outputGain.gain.setValueAtTime(value, this.ctx.currentTime);
  }

  get running(): boolean {
    return this.isRunning;
  }
}
