/**
 * COMPLEX RUNNER - Next-Gen 3D Sci-Fi Runner
 * Dynamic Sound Engine, Reactive Companion Voice Synthesizer & Speed-Adaptive Procedural Soundtrack
 */

export class AudioManager3D {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isInitialized = false;
    this.jetpackOsc = null;
    this.jetpackGain = null;

    // Main Menu Background Music (mainmenu.mp3 in loop)
    this.menuMusic = null;
    try {
      this.menuMusic = new Audio("mainmenu.mp3");
      this.menuMusic.loop = true;
      this.menuMusic.preload = "auto";
      this.menuMusic.volume = 0.85;
    } catch (e) {}

    // In-Game Background Music Track (Custom file fallback)
    this.bgMusic = null;
    try {
      this.bgMusic = new Audio("assets/audio/bgm.mp3");
      this.bgMusic.loop = true;
      this.bgMusic.preload = "auto";
      this.bgMusic.volume = 0.90; // Doubled in-game volume
    } catch (e) {}

    // Procedural Web Audio Music Synthesizer (100% Royalty Free, Zero Lag, Speed Adaptive)
    this.isBgmSynthesizing = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmTempo = 128; // BPM
    this.bgmMasterGain = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.bgmMasterGain = this.ctx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(1.0, this.ctx.currentTime); // Doubled in-game procedural master volume (from 0.55 to 1.0)
        this.bgmMasterGain.connect(this.ctx.destination);
        this.isInitialized = true;
      }
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  suspendContext() {
    if (this.ctx && this.ctx.state === "running") {
      this.ctx.suspend().catch(() => {});
    }
  }

  playMenuMusic() {
    if (this.isMuted) return;
    this.ensureContext();
    this.stopMusic(); // Stop in-game music if playing

    if (this.menuMusic) {
      try {
        this.menuMusic.currentTime = this.menuMusic.currentTime || 0;
        const playPromise = this.menuMusic.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log("Menu audio autoplay waiting for user interaction:", err);
          });
        }
      } catch (e) {
        console.warn("Could not play menu music:", e);
      }
    }
  }

  pauseMenuMusic() {
    if (this.menuMusic) {
      try { this.menuMusic.pause(); } catch (e) {}
    }
  }

  stopMenuMusic() {
    if (this.menuMusic) {
      try {
        this.menuMusic.pause();
        this.menuMusic.currentTime = 0;
      } catch (e) {}
    }
  }

  playMusic() {
    if (this.isMuted) return;
    this.ensureContext();
    this.stopMenuMusic(); // Stop main menu music when in-game run starts

    // Check if custom audio file is playable, else play procedural synthesized BGM
    if (this.bgMusic && this.bgMusic.src && !this.bgMusic.error) {
      this.bgMusic.currentTime = this.bgMusic.currentTime || 0;
      const playPromise = this.bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to built-in procedural synthesizer
          this.startProceduralBgm();
        });
      }
    } else {
      this.startProceduralBgm();
    }
  }

  pauseMusic() {
    if (this.bgMusic) {
      try { this.bgMusic.pause(); } catch (e) {}
    }
    this.stopProceduralBgm();
  }

  stopMusic() {
    if (this.bgMusic) {
      try {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        this.bgMusic.playbackRate = 1.0;
      } catch (e) {}
    }
    this.stopProceduralBgm();
  }

  /**
   * Speed-Adaptive Soundtrack: Accelerates subtly as player speed climbs
   */
  updateSpeed(currentSpeed, initialSpeed, maxSpeed) {
    const speedRatio = Math.max(0, Math.min(1, (currentSpeed - initialSpeed) / (maxSpeed - initialSpeed)));
    if (this.bgMusic) {
      this.bgMusic.playbackRate = 1.0 + speedRatio * 0.18;
    }
    this.bgmTempo = 128 + speedRatio * 24; // 128 BPM to 152 BPM
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.menuMusic) this.menuMusic.muted = this.isMuted;
    if (this.bgMusic) this.bgMusic.muted = this.isMuted;

    if (this.isMuted) {
      if (this.bgmMasterGain && this.ctx) {
        this.bgmMasterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this.stopMusic();
      this.stopMenuMusic();
    } else {
      if (this.bgmMasterGain && this.ctx) {
        this.bgmMasterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      }
    }
    return this.isMuted;
  }

  // =========================================================================
  // SUBWAY SURFERS STYLE HIGH-ENERGY PROCEDURAL SOUNDTRACK (Funk / Urban Runner Groove)
  // Upbeat, bouncy, brass stabs, marimba/pluck synths, and punchy 4-on-the-floor beat
  // =========================================================================
  startProceduralBgm() {
    if (this.isBgmSynthesizing || this.isMuted || !this.ctx) return;
    this.isBgmSynthesizing = true;
    this.bgmStep = 0;
    this.scheduleBgmStep();
  }

  stopProceduralBgm() {
    this.isBgmSynthesizing = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  scheduleBgmStep() {
    if (!this.isBgmSynthesizing || this.isMuted || !this.ctx) return;

    const stepInterval = (60 / this.bgmTempo) / 4; // 16th note in seconds
    const now = this.ctx.currentTime;
    const step = this.bgmStep % 32; // 2-bar 32-step cycle

    // 1. Subway Surfers Style Kick Drum (Punchy 4-on-the-floor: beats 0, 4, 8, 12, 16, 20, 24, 28)
    if (step % 4 === 0) {
      this.synthKick(now);
    }

    // 2. Crisp Urban Clap & Snare (Bouncy backbeats 4, 12, 20, 28 + offbeat ghost notes)
    if (step % 8 === 4) {
      this.synthSnare(now);
    } else if (step === 14 || step === 30) {
      this.synthSnare(now, 0.12); // Ghost snare tap
    }

    // 3. Shaker & Hi-Hat Swing Groove (Shuffled 16ths)
    if (step % 2 === 0) {
      this.synthHiHat(now, 0.06);
    } else {
      this.synthHiHat(now, 0.14); // Accented swing off-beat
    }

    // 4. Bouncy Funk Slap-Bass Groove (In D-Pentatonic / Urban runner bounce)
    // Notes: D2 (73.4), F2 (87.3), G2 (98.0), A2 (110.0), C3 (130.8), D3 (146.8)
    const bassPattern = [
      73.42, 0, 73.42, 87.31, 0, 98.00, 0, 110.00,
      130.81, 0, 110.00, 98.00, 87.31, 0, 98.00, 73.42,
      73.42, 0, 73.42, 87.31, 0, 98.00, 0, 146.83,
      130.81, 110.00, 98.00, 0, 87.31, 98.00, 110.00, 73.42
    ];
    const bassFreq = bassPattern[step];
    if (bassFreq > 0) {
      this.synthBass(now, bassFreq, stepInterval * 0.85);
    }

    // 5. Catchy Subway Surfers Style Marimba / Pluck Melody
    // Pentatonic, bright, playful and energetic
    const pluckMelody = {
      0: 587.33,  // D5
      2: 587.33,  // D5
      4: 698.46,  // F5
      6: 783.99,  // G5
      8: 880.00,  // A5
      10: 783.99, // G5
      12: 698.46, // F5
      14: 587.33, // D5
      16: 523.25, // C5
      18: 587.33, // D5
      20: 698.46, // F5
      22: 783.99, // G5
      24: 880.00, // A5
      26: 1046.50,// C6 (Bright flourish!)
      28: 880.00, // A5
      30: 783.99  // G5
    };

    if (pluckMelody[step]) {
      this.synthPluck(now, pluckMelody[step], stepInterval * 1.6);
    }

    // 6. Brass Horn Stabs on Key Turnarounds (Steps 0, 12, 16, 26)
    if (step === 0 || step === 12 || step === 16 || step === 26) {
      const brassNote = step === 0 ? 293.66 : (step === 12 ? 349.23 : 392.00);
      this.synthBrass(now, brassNote, stepInterval * 2.0);
    }

    this.bgmStep++;
    this.bgmTimer = setTimeout(() => this.scheduleBgmStep(), stepInterval * 1000);
  }

  synthKick(t) {
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(155, t);
      osc.frequency.exponentialRampToValueAtTime(42, t + 0.11);
      gain.gain.setValueAtTime(0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch (e) {}
  }

  synthSnare(t, vol = 0.28) {
    try {
      const bSize = this.ctx.sampleRate * 0.12;
      const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bSize * 0.35));
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1800, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMasterGain);
      noise.start(t);
      noise.stop(t + 0.12);
    } catch (e) {}
  }

  synthHiHat(t, vol = 0.08) {
    try {
      const bSize = this.ctx.sampleRate * 0.035;
      const buf = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(8000, t);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMasterGain);
      noise.start(t);
      noise.stop(t + 0.035);
    } catch (e) {}
  }

  synthBass(t, freq, dur) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(160, t + dur);
      gain.gain.setValueAtTime(0.38, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc.start(t);
      osc.stop(t + dur);
    } catch (e) {}
  }

  synthPluck(t, freq, dur) {
    try {
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      
      // Marimba wooden chirp click on attack
      const oscAttack = this.ctx.createOscillator();
      const gainAttack = this.ctx.createGain();
      oscAttack.type = "triangle";
      oscAttack.frequency.setValueAtTime(freq * 2.8, t);
      gainAttack.gain.setValueAtTime(0.18, t);
      gainAttack.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
      oscAttack.connect(gainAttack);
      gainAttack.connect(this.bgmMasterGain);
      oscAttack.start(t);
      oscAttack.stop(t + 0.03);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2400, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + dur);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc.start(t);
      osc.stop(t + dur);
    } catch (e) {}
  }

  synthBrass(t, freq, dur) {
    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 1.008, t); // Rich chorus detune
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(950, t);
      filter.Q.setValueAtTime(3.0, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmMasterGain);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch (e) {}
  }

  // =========================================================================
  // SOUND EFFECTS
  // =========================================================================
  playJump() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.16);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playSlide() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.28);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.32);
    } catch (e) {}
  }

  playCoin(multiplier = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Crisp Metallic / Plasma Transient Click (Sharp 8-10ms impulse)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.015);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.setValueAtTime(4500, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.45, now); // Doubled from 0.22
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.02);

      // 2. High-Tech Tactical Resonant Energy Pop (520Hz with tight decay)
      const baseTone = multiplier > 1 ? 680 : 540;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseTone * 1.3, now);
      osc.frequency.exponentialRampToValueAtTime(baseTone, now + 0.035);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);

      gain.gain.setValueAtTime(0.70, now); // Doubled from 0.35
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);

      // 3. Sub-Frequency Thud (Gives physical tactile weight to the collection)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      subGain.gain.setValueAtTime(0.55, now); // Doubled from 0.28
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.05);
    } catch (e) {}
  }

  playHit() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.48);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playLaser() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playPowerup() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.14);
      });
    } catch (e) {}
  }

  playShieldBreak() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  playDialogue(type) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";

      let f1 = 800, f2 = 1200, dur = 0.15;
      if (type === "bujji") { f1 = 700; f2 = 1400; dur = 0.18; }
      else if (type === "jetpack") { f1 = 500; f2 = 1600; dur = 0.25; }
      else if (type === "magnet") { f1 = 600; f2 = 900; dur = 0.15; }
      else if (type === "shield") { f1 = 400; f2 = 1100; dur = 0.2; }
      else if (type === "laser") { f1 = 1100; f2 = 400; dur = 0.12; }
      else if (type === "complex") { f1 = 300; f2 = 1800; dur = 0.35; }
      else if (type === "milestone") { f1 = 650; f2 = 1300; dur = 0.22; }

      osc.frequency.setValueAtTime(f1, now);
      osc.frequency.exponentialRampToValueAtTime(f2, now + dur);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.05);
    } catch (e) {}
  }
}
