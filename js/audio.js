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

    // High-Fidelity Music Track (Zero range socket leaks, decoded via Web Audio)
    this.menuMusic = null;
    this.bgMusic = null;
    this.bgmAudioBuffer = null;
    this.bgmSource = null;
    this._bgmBufferLoading = false;

    // Train Audio Sound Effects (Powered by high-precision Web Audio Synthesizers)
    this.trainHornAudio = null;
    this.trainPassAudio = null;

    // Procedural Web Audio Music Synthesizer (100% Royalty Free, Zero Lag, Speed Adaptive fallback)
    this.isBgmSynthesizing = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmTempo = 134; // BPM
    this.bgmMasterGain = null;

    // Subway Surfers Consecutive Coin Streak Pitch Arpeggio
    this.lastCoinTime = 0;
    this.consecutiveCoins = 0;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.bgmMasterGain = this.ctx.createGain();
        this.bgmMasterGain.gain.setValueAtTime(0.95, this.ctx.currentTime); // Master music punch
        this.bgmMasterGain.connect(this.ctx.destination);

        // Pre-generate reusable noise buffers to prevent per-beat buffer GC allocations
        const snareSize = Math.floor(this.ctx.sampleRate * 0.12);
        this._snareBuffer = this.ctx.createBuffer(1, snareSize, this.ctx.sampleRate);
        const sData = this._snareBuffer.getChannelData(0);
        for (let i = 0; i < snareSize; i++) sData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snareSize * 0.35));

        const hihatSize = Math.floor(this.ctx.sampleRate * 0.035);
        this._hihatBuffer = this.ctx.createBuffer(1, hihatSize, this.ctx.sampleRate);
        const hData = this._hihatBuffer.getChannelData(0);
        for (let i = 0; i < hihatSize; i++) hData[i] = (Math.random() * 2 - 1);

        this.isInitialized = true;
      }
    } catch (e) {
      // AudioContext unavailable
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

  async loadBgmBuffer() {
    if (this.bgmAudioBuffer || this._bgmBufferLoading || !this.ctx) return;
    this._bgmBufferLoading = true;
    try {
      const resp = await fetch("assets/audio/bgm.mp3");
      if (resp.ok) {
        const ab = await resp.arrayBuffer();
        if (this.ctx) {
          this.bgmAudioBuffer = await this.ctx.decodeAudioData(ab);
        }
      }
    } catch (e) {
      // Fallback handled seamlessly by procedural synth
    } finally {
      this._bgmBufferLoading = false;
    }
  }

  _startBufferPlayback() {
    if (this.isMuted || !this.ctx || !this.bgmAudioBuffer) return false;
    this.stopBgmBuffer();
    try {
      this.bgmSource = this.ctx.createBufferSource();
      this.bgmSource.buffer = this.bgmAudioBuffer;
      this.bgmSource.loop = true;
      this.bgmSource.connect(this.bgmMasterGain);
      this.bgmSource.start(0);
      return true;
    } catch (e) {
      return false;
    }
  }

  stopBgmBuffer() {
    if (this.bgmSource) {
      try {
        this.bgmSource.stop();
        this.bgmSource.disconnect();
      } catch (e) {}
      this.bgmSource = null;
    }
  }

  playMenuMusic() {
    if (this.isMuted) return;
    this.ensureContext();
    this.stopMusic();

    if (this.bgmAudioBuffer) {
      this._startBufferPlayback();
    } else {
      this.startProceduralBgm();
      this.loadBgmBuffer();
    }
  }

  pauseMenuMusic() {
    this.stopBgmBuffer();
    this.stopProceduralBgm();
  }

  stopMenuMusic() {
    this.stopBgmBuffer();
    this.stopProceduralBgm();
  }

  playMusic() {
    if (this.isMuted) return;
    this.ensureContext();
    this.stopMenuMusic();

    if (this.bgmAudioBuffer) {
      this._startBufferPlayback();
    } else {
      this.startProceduralBgm();
      this.loadBgmBuffer();
    }
  }

  pauseMusic() {
    this.stopBgmBuffer();
    this.stopProceduralBgm();
  }

  stopMusic() {
    this.stopBgmBuffer();
    this.stopProceduralBgm();
  }

  /**
   * Speed-Adaptive Soundtrack: Accelerates subtly as player speed climbs
   */
  updateSpeed(currentSpeed, initialSpeed, maxSpeed) {
    const speedRatio = Math.max(0, Math.min(1, (currentSpeed - initialSpeed) / (maxSpeed - initialSpeed)));
    if (this.bgmSource && this.ctx) {
      try {
        this.bgmSource.playbackRate.setValueAtTime(1.0 + speedRatio * 0.18, this.ctx.currentTime);
      } catch (e) {}
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
        this.bgmMasterGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
      }
      if (window.gameEngine3D) {
        if (window.gameEngine3D.state === "playing") {
          this.playMusic();
        } else if (window.gameEngine3D.state === "menu") {
          this.playMenuMusic();
        }
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
      if (!this._snareBuffer) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._snareBuffer;
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
      if (!this._hihatBuffer) return;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this._hihatBuffer;
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
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playDive() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.16);

      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.17);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.20);
    } catch (e) {}
  }

  playSlide() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. High-Performance Asphalt Friction Noise Scrape
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.32);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1100, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.30);
      filter.Q.setValueAtTime(2.2, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.42, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.32);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
      noise.stop(now + 0.34);

      // 2. Aerodynamic Pitch-Drop Whoosh Layer (Subway Surfers air velocity duck)
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.28);
      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.30);
    } catch (e) {}
  }

  /**
   * Subway Surfers Trademark Consecutive Coin Pitch-Ramp Arpeggio:
   * Rapid coin pickup chains within 320ms climb semitone by semitone up a bright melodic scale.
   */
  playCoin(multiplier = 1) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (now - this.lastCoinTime < 0.32) {
        this.consecutiveCoins = Math.min(10, this.consecutiveCoins + 1);
      } else {
        this.consecutiveCoins = 0;
      }
      this.lastCoinTime = now;

      // Pentatonic / Semitone step progression: 2^(step / 12)
      const semitoneStep = this.consecutiveCoins;
      const pitchMultiplier = Math.pow(2, semitoneStep / 12);
      const baseFreq = (880 + Math.min(220, (multiplier - 1) * 35)) * pitchMultiplier;

      // Crystal Dual-Tone Bell Chime: Primary fundamental + bell sparkle harmonic
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.04, now + 0.08);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFreq * 2.0, now);
      osc2.frequency.exponentialRampToValueAtTime(baseFreq * 2.5, now + 0.05);

      const vol = 0.14;
      gain1.gain.setValueAtTime(vol, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      gain2.gain.setValueAtTime(vol * 0.40, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.14);
      osc2.stop(now + 0.09);
    } catch (e) {}
  }

  /**
   * Futuristic Maglev Cargo Train Warning Horn:
   * Dual-harmonic resonant horn synthesized via Web Audio when an oncoming train approaches.
   */
  /**
   * Futuristic Maglev Cargo Train Warning Horn:
   * Plays recorded train horn audio file or synthesizes via Web Audio when an oncoming train approaches.
   */
  playTrainHorn() {
    if (this.isMuted) return;
    this.ensureContext();

    if (this.trainHornAudio) {
      try {
        const sound = this.trainHornAudio.cloneNode();
        sound.volume = 0.95;
        const p = sound.play();
        if (p !== undefined) {
          p.catch(() => this.synthTrainHorn());
        }
        return;
      } catch (e) {}
    }
    this.synthTrainHorn();
  }

  synthTrainHorn() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Dual resonant horn frequencies: 155Hz and 233Hz (Dystopian 5th chord)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sawtooth";
      osc1.frequency.setValueAtTime(155, now);
      osc2.frequency.setValueAtTime(233, now);
      osc1.frequency.linearRampToValueAtTime(152, now + 0.65);
      osc2.frequency.linearRampToValueAtTime(228, now + 0.65);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.linearRampToValueAtTime(500, now + 0.65);
      filter.Q.setValueAtTime(3.5, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.08); // Punchy horn attack
      gain.gain.setValueAtTime(0.45, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.70); // Smooth decay

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.72);
      osc2.stop(now + 0.72);
    } catch (e) {}
  }

  /**
   * Train Rush & Track Flyby Sound Effect:
   * Heavy 45Hz sub-bass roar, metal rail friction, and Doppler whoosh as train speeds past.
   */
  playTrainPass() {
    if (this.isMuted) return;
    this.ensureContext();

    if (this.trainPassAudio) {
      try {
        const sound = this.trainPassAudio.cloneNode();
        sound.volume = 0.90;
        const p = sound.play();
        if (p !== undefined) {
          p.catch(() => this.synthTrainPass());
        }
        return;
      } catch (e) {}
    }
    this.synthTrainPass();
  }

  synthTrainPass() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // 1. Heavy sub-bass rumble
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 1.2);

      const oscFilt = this.ctx.createBiquadFilter();
      oscFilt.type = "lowpass";
      oscFilt.frequency.setValueAtTime(140, now);

      oscGain.gain.setValueAtTime(0.01, now);
      oscGain.gain.linearRampToValueAtTime(0.55, now + 0.35);
      oscGain.gain.exponentialRampToValueAtTime(0.005, now + 1.2);

      osc.connect(oscFilt);
      oscFilt.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);

      // 2. Whoosh noise buffer
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilt = this.ctx.createBiquadFilter();
      noiseFilt.type = "bandpass";
      noiseFilt.frequency.setValueAtTime(350, now);
      noiseFilt.frequency.linearRampToValueAtTime(800, now + 0.35);
      noiseFilt.frequency.linearRampToValueAtTime(220, now + 1.2);
      noiseFilt.Q.setValueAtTime(2.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.50, now + 0.35);
      noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 1.2);

      noise.connect(noiseFilt);
      noiseFilt.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.25);
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
