import { useCallback, useState } from 'react';
import { AffirmationTicker } from './components/AffirmationTicker';
import { BreathingGuide } from './components/BreathingGuide';
import { BrainwaveBands } from './components/BrainwaveBands';
import { ControlPanel } from './components/ControlPanel';
import { EnergyOrb } from './components/EnergyOrb';
import { LRIndicator } from './components/LRIndicator';
import { PresetSelector } from './components/PresetSelector';
import { EnergyBar, ProgressBar, SessionTimer } from './components/SessionTimer';
import { SafetyBadge, SafetyModal, useSafetyAcknowledged } from './components/SafetyModal';
import { WaveformCanvas } from './components/WaveformCanvas';
import { useAudioEngine } from './hooks/useAudioEngine';
import { useSession } from './hooks/useSession';
function App() {
  const [safetyAcknowledged, acknowledgeSafety] = useSafetyAcknowledged();
  const [showSafety, setShowSafety] = useState(!safetyAcknowledged);

  const {
    params,
    updateParams,
    isPlaying: isManualPlaying,
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
  } = useAudioEngine();

  const handleSessionComplete = useCallback(() => {
    // session ended naturally
  }, []);

  const {
    sessionState,
    selectedPreset,
    selectPreset,
    startSession,
    stopSession,
    isSessionActive,
  } = useSession(handleSessionComplete);

  const isActive = isManualPlaying || isSessionActive;
  const currentHz = isSessionActive ? sessionState.currentBeatHz : params.beatFrequency;
  const isManualMode = selectedPreset.id === 'custom';

  const handleStart = async () => {
    if (!safetyAcknowledged) {
      setShowSafety(true);
      return;
    }

    if (isManualMode) {
      await startManual();
    } else {
      await startSession(selectedPreset);
    }
  };

  const handleStop = async () => {
    if (isManualPlaying) await stopManual();
    if (isSessionActive) await stopSession();
  };

  const handleSafetyAccept = () => {
    acknowledgeSafety();
    setShowSafety(false);
  };

  return (
    <div className="app">
      {showSafety && !safetyAcknowledged && (
        <SafetyModal onAcknowledge={handleSafetyAccept} />
      )}

      <header className="app-header">
        <h1 className="app-title">Psychic Gateway Alternator</h1>
        <p className="app-subtitle">Hemi-Sync Entrainment System</p>
        <SafetyBadge />
      </header>

      <section className="visualizer-section">
        <WaveformCanvas getAnalyser={getAnalyser} isPlaying={isActive} />
        <EnergyOrb beatHz={currentHz} isPlaying={isActive} />
        <BrainwaveBands currentHz={currentHz} />
        <LRIndicator
          currentSide={currentSide}
          beatHz={currentHz}
          isPlaying={isActive}
        />
      </section>

      <PresetSelector
        selectedId={selectedPreset.id}
        onSelect={selectPreset}
        disabled={isActive}
      />

      <ControlPanel
        params={params}
        onUpdate={updateParams}
        sweepEnabled={sweepEnabled}
        onSweepEnabledChange={setSweepEnabled}
        sweepFrom={sweepFrom}
        sweepTo={sweepTo}
        onSweepFromChange={setSweepFrom}
        onSweepToChange={setSweepTo}
        disabled={isSessionActive}
      />

      <div className="session-controls">
        <button
          className="btn btn-start"
          disabled={isActive}
          onClick={handleStart}
        >
          {isManualMode ? '▶ Start Manual' : `▶ Start ${selectedPreset.name}`}
        </button>
        <button
          className="btn btn-stop"
          disabled={!isActive}
          onClick={handleStop}
        >
          ■ Stop
        </button>
      </div>

      <div className="session-info">
        <SessionTimer
          sessionState={sessionState}
          isManualMode={isManualMode && isManualPlaying}
        />
        {isSessionActive && <ProgressBar progress={sessionState.progress} />}
        <EnergyBar
          beatHz={currentHz}
          progress={isSessionActive ? sessionState.progress : isManualPlaying ? 0.5 : 0}
        />
      </div>

      <BreathingGuide
        pattern={isSessionActive ? sessionState.breathingPattern : null}
        isActive={isSessionActive}
      />

      <AffirmationTicker
        text={isSessionActive ? sessionState.currentAffirmation : ''}
        isVisible={isSessionActive}
      />

      <footer className="app-footer">
        Use stereo headphones · Keep volume low · Not medical advice
      </footer>
    </div>
  );
}

export default App;
