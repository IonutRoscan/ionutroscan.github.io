/**
 * NOCTURNE ARCHIVE // CODEX SYNTHESIZED SOUND RELAY
 * Procedural mechanical acoustics via Web Audio API.
 */

class CodexAudioRelay {
  constructor(options = {}) {
    this.options = Object.assign({
      masterVolume: 0.18,
      muted: false
    }, options);

    this.ctx = null;
    this.masterGain = null;
    this.isUnlocked = false;

    this.bindUnlockListeners();
  }

  bindUnlockListeners() {
    const unlock = () => {
      if (this.isUnlocked) return;
      this.initContext();
      this.isUnlocked = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  initContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(
      this.options.muted ? 0 : this.options.masterVolume, 
      this.ctx.currentTime
    );
    this.masterGain.connect(this.ctx.destination);
  }

  ensureReady() {
    if (!this.ctx) this.initContext();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return Boolean(this.ctx && !this.options.muted);
  }

  setMute(muted) {
    this.options.muted = Boolean(muted);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.options.muted ? 0 : this.options.masterVolume,
        this.ctx.currentTime,
        0.03
      );
    }
  }

  toggleMute() {
    this.setMute(!this.options.muted);
    return this.options.muted;
  }

  /**
   * Subtle metallic click as rotary segments pass detents.
   */
  playRatchet(intensity = 1.0) {
    if (!this.ensureReady()) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400 * intensity, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.024);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(3.2, t);

    gain.gain.setValueAtTime(0.35 * Math.min(1.0, intensity), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.024);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.025);
  }

  /**
   * Heavy pneumatic uncoupling when a cassette ejects.
   */
  playEject() {
    if (!this.ensureReady()) return;

    const t = this.ctx.currentTime;

    // Air release burst (white noise buffer)
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1800, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(450, t + 0.16);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Mechanical unlatch pitch drop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.12);

    oscGain.gain.setValueAtTime(0.18, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(t);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /**
   * Deep metallic thud and relay engage when a cassette locks in place.
   */
  playLock() {
    if (!this.ensureReady()) return;

    const t = this.ctx.currentTime;

    // Sub-bass solenoid impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 0.22);

    subGain.gain.setValueAtTime(0.5, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    // Metallic relay click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();

    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(820, t);
    clickOsc.frequency.exponentialRampToValueAtTime(140, t + 0.045);

    clickGain.gain.setValueAtTime(0.24, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);

    subOsc.start(t);
    clickOsc.start(t);
    clickOsc.stop(t + 0.05);
    subOsc.stop(t + 0.23);
  }
}