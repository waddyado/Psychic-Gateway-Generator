export type BeatMode = 'alternator' | 'binaural' | 'blend';

export type BreathingPattern = '4-7-8' | 'box' | null;

export interface AudioParams {
  beatFrequency: number;
  beatDifference: number;
  carrierFrequency: number;
  alternatorBlend: number;
  mode: BeatMode;
  volume: number;
  resonanceEnabled: boolean;
}

export interface SessionPhase {
  label: string;
  durationSec: number;
  beatHzStart: number;
  beatHzEnd: number;
  alternatorBlend: number;
  baseCarrierHz: number;
  affirmation?: string;
  breathingPattern?: BreathingPattern;
}

export interface SessionDefinition {
  id: string;
  name: string;
  description: string;
  targetBand: string;
  phases: SessionPhase[];
  affirmations: string[];
}

export interface SessionState {
  isRunning: boolean;
  currentPhaseIndex: number;
  phaseLabel: string;
  elapsedSec: number;
  totalDurationSec: number;
  progress: number;
  currentBeatHz: number;
  breathingPattern: BreathingPattern;
  currentAffirmation: string;
}

export type SideIndicator = 'left' | 'right' | 'both' | 'none';

export interface AudioEngineCallbacks {
  onSideChange?: (side: SideIndicator) => void;
}

export const DEFAULT_AUDIO_PARAMS: AudioParams = {
  beatFrequency: 10,
  beatDifference: 6,
  carrierFrequency: 100,
  alternatorBlend: 0.5,
  mode: 'blend',
  volume: 0.3,
  resonanceEnabled: true,
};

export const VOLUME_MAX = 0.7;
export const FADE_DURATION_SEC = 3;
