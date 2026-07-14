class AlternatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.carrierPhase = 0;
    this.switchPhase = 0;
    this.panSide = 0;
    this.carrierFreq = 100;
    this.switchFreq = 10;
    this.gain = 0.5;
    this.sideCounter = 0;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.carrierFrequency !== undefined) this.carrierFreq = data.carrierFrequency;
      if (data.switchFrequency !== undefined) this.switchFreq = data.switchFrequency;
      if (data.gain !== undefined) this.gain = data.gain;
    };
  }

  process(_inputs, outputs) {
    const output = outputs[0];
    if (!output || output.length < 2) return true;

    const left = output[0];
    const right = output[1];
    const sr = sampleRate;

    for (let i = 0; i < left.length; i++) {
      this.switchPhase += this.switchFreq / sr;
      if (this.switchPhase >= 1) {
        this.switchPhase -= 1;
        this.panSide = 1 - this.panSide;
        this.sideCounter++;
        if (this.sideCounter % 1 === 0) {
          this.port.postMessage({ side: this.panSide === 0 ? 'left' : 'right' });
        }
      }

      this.carrierPhase += this.carrierFreq / sr;
      if (this.carrierPhase >= 1) this.carrierPhase -= 1;

      const sample = Math.sin(this.carrierPhase * 2 * Math.PI) * this.gain;

      if (this.panSide === 0) {
        left[i] = sample;
        right[i] = 0;
      } else {
        left[i] = 0;
        right[i] = sample;
      }
    }

    return true;
  }
}

registerProcessor('alternator-processor', AlternatorProcessor);
