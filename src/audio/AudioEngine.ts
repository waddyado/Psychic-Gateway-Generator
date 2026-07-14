import { BinauralOscillator } from './BinauralOscillator';
import { ResonanceLayer } from './ResonanceLayer';
import {
  AudioEngineCallbacks,
  AudioParams,
  BeatMode,
  DEFAULT_AUDIO_PARAMS,
  FADE_DURATION_SEC,
  SideIndicator,
  VOLUME_MAX,
} from './types';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private alternatorNode: AudioWorkletNode | null = null;
  private alternatorGain: GainNode | null = null;
  private binaural: BinauralOscillator | null = null;
  private resonance: ResonanceLayer | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private mixGain: GainNode | null = null;
  private params: AudioParams = { ...DEFAULT_AUDIO_PARAMS };
  private callbacks: AudioEngineCallbacks = {};
  private isPlaying = false;
  private sideInterval: ReturnType<typeof setInterval> | null = null;
  private currentSide: SideIndicator = 'none';

  setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getParams(): AudioParams {
    return { ...this.params };
  }

  isActive(): boolean {
    return this.isPlaying;
  }

  getCurrentSide(): SideIndicator {
    return this.currentSide;
  }

  async init(): Promise<void> {
    if (this.ctx) return;

    this.ctx = new AudioContext();
    await this.ctx.audioWorklet.addModule('/alternator-processor.js');

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.mixGain = this.ctx.createGain();
    this.mixGain.gain.value = 1;

    this.alternatorGain = this.ctx.createGain();
    this.alternatorGain.gain.value = 0;

    this.alternatorNode = new AudioWorkletNode(this.ctx, 'alternator-processor');
    this.alternatorNode.connect(this.alternatorGain);

    this.alternatorNode.port.onmessage = (event) => {
      if (event.data.side) {
        this.currentSide = event.data.side as SideIndicator;
        this.callbacks.onSideChange?.(this.currentSide);
      }
    };

    this.binaural = new BinauralOscillator(this.ctx);
    this.resonance = new ResonanceLayer(this.ctx);

    this.alternatorGain.connect(this.mixGain);
    this.binaural.output.connect(this.resonance.input);
    this.resonance.output.connect(this.mixGain);

    this.mixGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.updateAlternatorParams();
    this.updateModeGains();
  }

  async start(): Promise<void> {
    await this.init();
    if (!this.ctx || this.isPlaying) return;

    await this.ctx.resume();

    this.binaural?.start();
    if (this.params.resonanceEnabled) {
      this.resonance?.start();
    }

    this.alternatorNode?.port.postMessage({
      carrierFrequency: this.params.carrierFrequency,
      switchFrequency: this.params.beatFrequency,
      gain: 0.5,
    });

    this.isPlaying = true;
    this.updateModeGains();

    const targetVolume = Math.min(this.params.volume, VOLUME_MAX);
    if (this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
      this.masterGain.gain.linearRampToValueAtTime(targetVolume, now + FADE_DURATION_SEC);
    }

    this.startSideFallback();
  }

  private startSideFallback(): void {
    this.stopSideFallback();
    const hz = this.params.beatFrequency;
    if (hz <= 0) return;

    const halfPeriodMs = (1000 / hz) / 2;
    let side: SideIndicator = 'left';
    this.currentSide = side;
    this.callbacks.onSideChange?.(side);

    this.sideInterval = setInterval(() => {
      side = side === 'left' ? 'right' : 'left';
      this.currentSide = side;
      this.callbacks.onSideChange?.(side);
    }, halfPeriodMs);
  }

  private stopSideFallback(): void {
    if (this.sideInterval) {
      clearInterval(this.sideInterval);
      this.sideInterval = null;
    }
  }

  async stop(): Promise<void> {
    if (!this.ctx || !this.isPlaying) return;

    this.stopSideFallback();
    this.currentSide = 'none';
    this.callbacks.onSideChange?.('none');

    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + FADE_DURATION_SEC);
    }

    await new Promise((resolve) => setTimeout(resolve, FADE_DURATION_SEC * 1000));

    this.binaural?.stop();
    this.resonance?.stop();
    this.isPlaying = false;
  }

  setBeatFrequency(hz: number): void {
    this.params.beatFrequency = hz;

    if (this.alternatorNode) {
      this.alternatorNode.port.postMessage({ switchFrequency: hz });
    }

    this.binaural?.setFrequencies(this.params.carrierFrequency, this.params.beatDifference);

    if (this.isPlaying) {
      this.stopSideFallback();
      this.startSideFallback();
    }
  }

  rampBeatFrequency(hz: number, durationSec: number): void {
    this.params.beatFrequency = hz;

    if (this.alternatorNode) {
      this.alternatorNode.port.postMessage({ switchFrequency: hz });
    }

    this.binaural?.rampFrequencies(
      this.params.carrierFrequency,
      this.params.beatDifference,
      durationSec
    );

    if (this.isPlaying) {
      this.stopSideFallback();
      this.startSideFallback();
    }
  }

  setBeatDifference(diff: number): void {
    this.params.beatDifference = diff;
    this.binaural?.setFrequencies(this.params.carrierFrequency, diff);
  }

  setCarrierFrequency(hz: number): void {
    this.params.carrierFrequency = hz;

    if (this.alternatorNode) {
      this.alternatorNode.port.postMessage({ carrierFrequency: hz });
    }

    this.binaural?.setFrequencies(hz, this.params.beatDifference);
  }

  setAlternatorBlend(blend: number): void {
    this.params.alternatorBlend = blend;
    this.updateModeGains();
  }

  setMode(mode: BeatMode): void {
    this.params.mode = mode;
    this.updateModeGains();
  }

  setVolume(volume: number): void {
    this.params.volume = Math.min(volume, VOLUME_MAX);
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setValueAtTime(this.params.volume, this.ctx.currentTime);
    }
  }

  setResonanceEnabled(enabled: boolean): void {
    this.params.resonanceEnabled = enabled;
    this.resonance?.setEnabled(enabled);
  }

  updateParams(partial: Partial<AudioParams>): void {
    if (partial.beatFrequency !== undefined) {
      this.setBeatFrequency(partial.beatFrequency);
    }
    if (partial.beatDifference !== undefined) {
      this.setBeatDifference(partial.beatDifference);
    }
    if (partial.carrierFrequency !== undefined) {
      this.setCarrierFrequency(partial.carrierFrequency);
    }
    if (partial.alternatorBlend !== undefined) {
      this.setAlternatorBlend(partial.alternatorBlend);
    }
    if (partial.mode !== undefined) {
      this.setMode(partial.mode);
    }
    if (partial.volume !== undefined) {
      this.setVolume(partial.volume);
    }
    if (partial.resonanceEnabled !== undefined) {
      this.setResonanceEnabled(partial.resonanceEnabled);
    }
  }

  private updateAlternatorParams(): void {
    if (!this.alternatorNode) return;
    this.alternatorNode.port.postMessage({
      carrierFrequency: this.params.carrierFrequency,
      switchFrequency: this.params.beatFrequency,
      gain: 0.5,
    });
  }

  private updateModeGains(): void {
    if (!this.alternatorGain || !this.binaural) return;

    const now = this.ctx?.currentTime ?? 0;
    let altGain = 0;
    let binGain = 0;

    switch (this.params.mode) {
      case 'alternator':
        altGain = 1;
        break;
      case 'binaural':
        binGain = 1;
        break;
      case 'blend':
        altGain = this.params.alternatorBlend;
        binGain = 1 - this.params.alternatorBlend;
        break;
    }

    this.alternatorGain.gain.setValueAtTime(altGain, now);
    this.binaural.setGain(binGain);
  }

  dispose(): void {
    this.stopSideFallback();
    this.binaural?.stop();
    this.resonance?.stop();
    this.ctx?.close();
    this.ctx = null;
    this.isPlaying = false;
  }
}

let engineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!engineInstance) {
    engineInstance = new AudioEngine();
  }
  return engineInstance;
}
