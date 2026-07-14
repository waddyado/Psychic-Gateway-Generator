import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioEngine } from '../audio/AudioEngine';
import { AudioParams, DEFAULT_AUDIO_PARAMS, SideIndicator } from '../audio/types';

export function useAudioEngine() {
  const engineRef = useRef(getAudioEngine());
  const [params, setParams] = useState<AudioParams>({ ...DEFAULT_AUDIO_PARAMS });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSide, setCurrentSide] = useState<SideIndicator>('none');
  const [sweepEnabled, setSweepEnabled] = useState(false);
  const [sweepFrom, setSweepFrom] = useState(4);
  const [sweepTo, setSweepTo] = useState(40);
  const sweepRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const engine = engineRef.current;
    engine.setCallbacks({
      onSideChange: (side) => setCurrentSide(side),
    });
    return () => {
      engine.setCallbacks({});
    };
  }, []);

  const updateParams = useCallback((partial: Partial<AudioParams>) => {
    engineRef.current.updateParams(partial);
    setParams((prev) => ({ ...prev, ...partial }));
  }, []);

  const startManual = useCallback(async () => {
    const engine = engineRef.current;
    engine.updateParams(params);
    await engine.start();
    setIsPlaying(true);

    if (sweepEnabled) {
      let direction = 1;
      let current = sweepFrom;
      engine.setBeatFrequency(current);

      sweepRef.current = setInterval(() => {
        current += direction * 0.5;
        if (current >= sweepTo) {
          current = sweepTo;
          direction = -1;
        } else if (current <= sweepFrom) {
          current = sweepFrom;
          direction = 1;
        }
        engine.setBeatFrequency(current);
        setParams((prev) => ({ ...prev, beatFrequency: current }));
      }, 500);
    }
  }, [params, sweepEnabled, sweepFrom, sweepTo]);

  const stopManual = useCallback(async () => {
    if (sweepRef.current) {
      clearInterval(sweepRef.current);
      sweepRef.current = null;
    }
    await engineRef.current.stop();
    setIsPlaying(false);
    setCurrentSide('none');
  }, []);

  const getAnalyser = useCallback(() => {
    return engineRef.current.getAnalyser();
  }, []);

  return {
    params,
    updateParams,
    isPlaying,
    currentSide,
    startManual,
    stopManual,
    getAnalyser,
    sweepEnabled,
    setSweepEnabled,
    sweepFrom,
    setSweepFrom,
    sweepTo,
    setSweepTo,
  };
}
