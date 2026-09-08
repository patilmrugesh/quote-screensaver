import { AmbientSoundType } from "./types";

/**
 * Procedural ambient audio synthesizer using native Web Audio API.
 * Completely client-side, zero external assets, infinite seamless generation.
 */
class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect: () => void }[] = [];
  private currentType: AmbientSoundType = "none";
  private currentVolume = 0.5;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public stop() {
    if (this.masterGain && this.ctx) {
      // Fade out smoothly over 0.3 seconds to avoid pops
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        this.cleanupNodes();
        this.currentType = "none";
      }, 350);
    } else {
      this.cleanupNodes();
      this.currentType = "none";
    }
  }

  private cleanupNodes() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        node.disconnect();
      } catch {}
    });
    this.activeNodes = [];
  }

  public play(type: AmbientSoundType, volume = this.currentVolume) {
    if (typeof window === "undefined") return;
    if (type === "none") {
      this.stop();
      return;
    }

    const ctx = this.initContext();
    this.cleanupNodes();

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.connect(ctx.destination);
    }

    this.currentVolume = volume;
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(this.currentVolume, ctx.currentTime, 0.2);
    this.currentType = type;

    switch (type) {
      case "brown-noise":
        this.createBrownNoise(ctx, this.masterGain);
        break;
      case "rain":
        this.createRainSound(ctx, this.masterGain);
        break;
      case "binaural":
        this.createBinauralDrone(ctx, this.masterGain);
        break;
      case "campfire":
        this.createCampfireSound(ctx, this.masterGain);
        break;
    }
  }

  public getCurrentType(): AmbientSoundType {
    return this.currentType;
  }

  // --- Audio Generators ---

  private createBrownNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain boost
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start(0);

    this.activeNodes.push(whiteNoise, filter);
  }

  private createRainSound(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = Math.random() * 2 - 1;
      right[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter1 = ctx.createBiquadFilter();
    filter1.type = "bandpass";
    filter1.frequency.setValueAtTime(1000, ctx.currentTime);
    filter1.Q.setValueAtTime(0.7, ctx.currentTime);

    const filter2 = ctx.createBiquadFilter();
    filter2.type = "lowpass";
    filter2.frequency.setValueAtTime(3200, ctx.currentTime);

    noise.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(destination);
    noise.start(0);

    this.activeNodes.push(noise, filter1, filter2);
  }

  private createBinauralDrone(ctx: AudioContext, destination: AudioNode) {
    // 216Hz base frequency with 10Hz alpha wave offset (226Hz right ear)
    const baseFreq = 216;
    const offset = 10;

    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const panLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const panRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    oscLeft.type = "sine";
    oscRight.type = "sine";
    oscLeft.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    oscRight.frequency.setValueAtTime(baseFreq + offset, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    if (panLeft && panRight) {
      panLeft.pan.setValueAtTime(-1, ctx.currentTime);
      panRight.pan.setValueAtTime(1, ctx.currentTime);

      oscLeft.connect(panLeft);
      panLeft.connect(gain);

      oscRight.connect(panRight);
      panRight.connect(gain);
      this.activeNodes.push(panLeft, panRight);
    } else {
      oscLeft.connect(gain);
      oscRight.connect(gain);
    }

    gain.connect(destination);
    oscLeft.start(0);
    oscRight.start(0);

    this.activeNodes.push(oscLeft, oscRight, gain);
  }

  private createCampfireSound(ctx: AudioContext, destination: AudioNode) {
    // Low rumble base
    this.createBrownNoise(ctx, destination);

    // Filtered crackle generator
    const bufferSize = ctx.sampleRate * 2;
    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.003) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      } else {
        data[i] = 0;
      }
    }

    const crackleSource = ctx.createBufferSource();
    crackleSource.buffer = crackleBuffer;
    crackleSource.loop = true;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = "highpass";
    crackleFilter.frequency.setValueAtTime(1200, ctx.currentTime);

    const crackleGain = ctx.createGain();
    crackleGain.gain.setValueAtTime(0.6, ctx.currentTime);

    crackleSource.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(destination);
    crackleSource.start(0);

    this.activeNodes.push(crackleSource, crackleFilter, crackleGain);
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
