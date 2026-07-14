import { getAudioEngine } from '../audio/AudioEngine';
import { SessionDefinition, SessionPhase, SessionState } from '../audio/types';
import { getTotalDuration } from './presets';

type SessionEventType = 'phaseChange' | 'progress' | 'complete' | 'tick';

interface SessionEvent {
  type: SessionEventType;
  state: SessionState;
}

type SessionListener = (event: SessionEvent) => void;

const INITIAL_STATE: SessionState = {
  isRunning: false,
  currentPhaseIndex: 0,
  phaseLabel: '',
  elapsedSec: 0,
  totalDurationSec: 0,
  progress: 0,
  currentBeatHz: 10,
  breathingPattern: null,
  currentAffirmation: '',
};

export class SessionController {
  private preset: SessionDefinition | null = null;
  private state: SessionState = { ...INITIAL_STATE };
  private listeners: SessionListener[] = [];
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private phaseStartTime = 0;
  private sessionStartTime = 0;
  private affirmationIndex = 0;
  private affirmationInterval: ReturnType<typeof setInterval> | null = null;

  subscribe(listener: SessionListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState(): SessionState {
    return { ...this.state };
  }

  async start(preset: SessionDefinition): Promise<void> {
    this.stopTimers();
    this.preset = preset;
    this.affirmationIndex = 0;

    const totalDuration = preset.phases.length > 0 ? getTotalDuration(preset) : 0;

    this.state = {
      ...INITIAL_STATE,
      isRunning: true,
      totalDurationSec: totalDuration,
      currentAffirmation: preset.affirmations[0] ?? '',
    };

    const engine = getAudioEngine();
    await engine.start();

    if (preset.phases.length > 0) {
      this.sessionStartTime = Date.now();
      this.enterPhase(0);
      this.tickInterval = setInterval(() => this.tick(), 100);
      this.startAffirmationRotation();
    }

    this.emit('tick');
  }

  async stop(): Promise<void> {
    this.stopTimers();
    const engine = getAudioEngine();
    await engine.stop();

    this.state = { ...INITIAL_STATE };
    this.preset = null;
    this.emit('complete');
  }

  private stopTimers(): void {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    if (this.affirmationInterval) {
      clearInterval(this.affirmationInterval);
      this.affirmationInterval = null;
    }
  }

  private enterPhase(index: number): void {
    if (!this.preset || index >= this.preset.phases.length) return;

    const phase = this.preset.phases[index];
    this.phaseStartTime = Date.now();

    this.state.currentPhaseIndex = index;
    this.state.phaseLabel = phase.label;
    this.state.currentBeatHz = phase.beatHzStart;
    this.state.breathingPattern = phase.breathingPattern ?? null;

    if (phase.affirmation) {
      this.state.currentAffirmation = phase.affirmation;
    }

    const engine = getAudioEngine();
    engine.setCarrierFrequency(phase.baseCarrierHz);
    engine.setAlternatorBlend(phase.alternatorBlend);
    engine.setBeatFrequency(phase.beatHzStart);
    engine.setBeatDifference(phase.beatHzStart);

    this.emit('phaseChange');
  }

  private tick(): void {
    if (!this.preset || this.preset.phases.length === 0) return;

    const now = Date.now();
    const phase = this.preset.phases[this.state.currentPhaseIndex];
    const phaseElapsed = (now - this.phaseStartTime) / 1000;
    const sessionElapsed = (now - this.sessionStartTime) / 1000;

    this.state.elapsedSec = sessionElapsed;
    this.state.progress = Math.min(sessionElapsed / this.state.totalDurationSec, 1);

    const phaseProgress = Math.min(phaseElapsed / phase.durationSec, 1);
    const currentHz = phase.beatHzStart + (phase.beatHzEnd - phase.beatHzStart) * phaseProgress;
    this.state.currentBeatHz = currentHz;

    const engine = getAudioEngine();
    engine.setBeatFrequency(currentHz);
    engine.setBeatDifference(currentHz);

    if (phaseElapsed >= phase.durationSec) {
      const nextIndex = this.state.currentPhaseIndex + 1;
      if (nextIndex >= this.preset.phases.length) {
        this.completeSession();
        return;
      }
      this.enterPhase(nextIndex);
    }

    this.emit('tick');
  }

  private async completeSession(): Promise<void> {
    this.stopTimers();
    this.state.isRunning = false;
    this.state.progress = 1;

    const engine = getAudioEngine();
    await engine.stop();

    this.emit('complete');
  }

  private startAffirmationRotation(): void {
    if (!this.preset || this.preset.affirmations.length <= 1) return;

    this.affirmationInterval = setInterval(() => {
      if (!this.preset) return;
      this.affirmationIndex = (this.affirmationIndex + 1) % this.preset.affirmations.length;
      this.state.currentAffirmation = this.preset.affirmations[this.affirmationIndex];
      this.emit('tick');
    }, 45000);
  }

  getCurrentPhase(): SessionPhase | null {
    if (!this.preset || this.preset.phases.length === 0) return null;
    return this.preset.phases[this.state.currentPhaseIndex] ?? null;
  }

  private emit(type: SessionEventType): void {
    const event: SessionEvent = { type, state: { ...this.state } };
    this.listeners.forEach((l) => l(event));
  }
}

let sessionInstance: SessionController | null = null;

export function getSessionController(): SessionController {
  if (!sessionInstance) {
    sessionInstance = new SessionController();
  }
  return sessionInstance;
}
