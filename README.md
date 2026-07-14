# Psychic Gateway Alternator

A browser-based meditation app inspired by Hemi-Sync and the CIA Gateway Experience. It combines sharp left/right tone alternation with binaural beats to encourage hemispheric synchronization, guided by Focus Level presets, timed session waves, and real-time brainwave visuals.

**Use stereo headphones at low volume.** This app is for personal meditation and exploration only — not medical advice.

## Features

### Audio Engine
- **Alternator mode** — Single tone that switches sharply between left and right ears at a chosen frequency (sample-accurate via AudioWorklet)
- **Binaural mode** — Dual carriers per ear (e.g. 100 Hz left + 106 Hz right = 6 Hz beat)
- **Blend mode** — Mix alternator and binaural signals with adjustable ratio
- **Resonant tuning** — Optional 7.83 Hz Schumann resonance amplitude modulation
- **Frequency sweep** — Manual mode can sweep between a low and high beat frequency

### Gateway Focus Level Presets
| Preset | Target Band | Duration |
|---|---|---|
| Relaxation / Orientation | Alpha (8–12 Hz) | ~25 min |
| Deepening (Focus 10/12) | Theta (4–8 Hz) | ~35 min |
| Exploration / Psychic | Theta → Beta → Gamma | ~27 min |
| Custom | User-defined | Open |

Each preset runs phased sessions with slow ramp-ups, sustained plateaus, and gentle returns to baseline. Guided breathing (4-7-8 and box breath) and rotating affirmations are included during sessions.

### Visuals & Controls
- Real-time waveform display
- Pulsing energy orb synced to beat frequency
- Brainwave band indicators (δ θ α β γ)
- Left/right ear indicators
- Beat frequency, beat difference, carrier frequency, volume, and mode controls
- Session timer and progress/energy bars

## Safety

Before first use, you must acknowledge:
- **Headphones are required** for stereo separation
- **Keep volume low** — default starts at 30%, max capped at 70%
- **Do not use while driving** or operating machinery
- **Epilepsy warning** — rapid frequency changes may affect photosensitive individuals

Audio fades in and out over 3 seconds to avoid sudden loud tones.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- Stereo headphones

### Install & Run

```bash
git clone https://github.com/waddyado/Psychic-Gateway-Generator.git
cd Psychic-Gateway-Generator
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

Output is written to the `dist/` folder.

## Usage

1. Read and accept the safety disclaimer on first launch
2. Choose a **Focus Level** preset or **Custom** for manual control
3. Adjust audio mode, frequencies, and volume as needed
4. Press **Start** and listen through headphones
5. Press **Stop** at any time — audio fades out gently

In **Custom** mode, enable **Frequency Sweep** to automatically oscillate between two beat frequencies.

## Tech Stack

- **Vite + React 18 + TypeScript**
- **Web Audio API** with AudioWorklet for precise L/R alternation
- **Canvas 2D** + AnalyserNode for waveform visualization
- Pure CSS — no UI framework

## Project Structure

```
src/
├── audio/           AudioEngine, binaural oscillators, resonance layer
├── session/         Presets and session phase controller
├── components/      UI — controls, visualizers, safety modal
├── hooks/           React hooks for audio and session state
└── styles/          Global and component CSS
public/
└── alternator-processor.js   AudioWorklet for L/R panning
```

## Disclaimer

This project is inspired by publicly documented concepts from the Monroe Institute and declassified Gateway Experience materials. It is an independent tool for meditation and personal exploration. It is not affiliated with, endorsed by, or a replacement for the Monroe Institute or any medical treatment.

## License

Private — see repository owner for usage terms.
