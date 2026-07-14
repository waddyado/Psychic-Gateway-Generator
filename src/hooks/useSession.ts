import { useCallback, useEffect, useRef, useState } from 'react';
import { SessionDefinition, SessionState } from '../audio/types';
import { getSessionController } from '../session/SessionController';
import { CUSTOM_PRESET } from '../session/presets';

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

export function useSession(onComplete?: () => void) {
  const controllerRef = useRef(getSessionController());
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_STATE);
  const [selectedPreset, setSelectedPreset] = useState<SessionDefinition>(CUSTOM_PRESET);

  useEffect(() => {
    const unsubscribe = controllerRef.current.subscribe((event) => {
      setSessionState(event.state);
      if (event.type === 'complete') {
        onComplete?.();
      }
    });
    return unsubscribe;
  }, [onComplete]);

  const startSession = useCallback(async (preset?: SessionDefinition) => {
    const p = preset ?? selectedPreset;
    setSelectedPreset(p);
    await controllerRef.current.start(p);
  }, [selectedPreset]);

  const stopSession = useCallback(async () => {
    await controllerRef.current.stop();
  }, []);

  const selectPreset = useCallback((preset: SessionDefinition) => {
    setSelectedPreset(preset);
  }, []);

  return {
    sessionState,
    selectedPreset,
    selectPreset,
    startSession,
    stopSession,
    isSessionActive: sessionState.isRunning,
  };
}
