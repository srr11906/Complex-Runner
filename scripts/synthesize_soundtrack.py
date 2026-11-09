import os
import math
import wave
import struct
import subprocess
import numpy as np
from scipy import signal

SAMPLE_RATE = 44100

def create_reverb(audio, sample_rate=44100, delays=[0.029, 0.037, 0.043, 0.051], decays=[0.4, 0.35, 0.3, 0.25]):
    """Schroeder/Freeverb style comb filter reverb"""
    out = np.copy(audio)
    for d_time, decay in zip(delays, decays):
        d_samples = int(d_time * sample_rate)
        comb = np.zeros_like(audio)
        comb[d_samples:] = audio[:-d_samples] * decay
        out += comb * 0.35
    return out / (np.max(np.abs(out)) + 1e-6)

def generate_kick(duration, sample_rate=44100):
    """Deep punchy sub kick"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    # Pitch envelope: 150 Hz down to 42 Hz
    freq_env = 42.0 + 108.0 * np.exp(-t * 32.0)
    phase = 2.0 * np.pi * np.cumsum(freq_env) / sample_rate
    body = np.sin(phase)
    # Amp envelope
    amp_env = np.exp(-t * 9.5)
    # Click transient
    click = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 180.0) * 0.3
    return (body * amp_env + click) * 0.9

def generate_dhol(duration, sample_rate=44100, pitch=78.0, slap=False):
    """Heavy cinematic Indian Dhol drum hit"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    start_pitch = pitch * (2.4 if slap else 1.8)
    freq_env = pitch + (start_pitch - pitch) * np.exp(-t * (45.0 if slap else 28.0))
    phase = 2.0 * np.pi * np.cumsum(freq_env) / sample_rate
    base = np.sin(phase) + 0.3 * np.sin(2.0 * phase) + 0.15 * np.sin(3.0 * phase)
    amp_env = np.exp(-t * (14.0 if slap else 8.0))
    # Snappy membrane skin transient
    membrane = np.random.uniform(-0.8, 0.8, len(t)) * np.exp(-t * (90.0 if slap else 40.0)) * (0.45 if slap else 0.25)
    return (base * amp_env + membrane) * 0.85

def generate_snare(duration, sample_rate=44100):
    """Cyber industrial crisp snare"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    tonal = np.sin(2.0 * np.pi * (180.0 + 90.0 * np.exp(-t * 40.0)) * t) * np.exp(-t * 22.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 16.0)
    return (tonal * 0.4 + noise * 0.6) * 0.75

def generate_hihat(duration, sample_rate=44100, open_hat=False):
    """Metallic cyber hi-hat"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    decay = 18.0 if open_hat else 65.0
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * decay)
    # High-pass filter simulation
    b, a = signal.butter(2, 6500 / (sample_rate / 2), btype='high')
    filtered = signal.lfilter(b, a, noise)
    return filtered * (0.35 if open_hat else 0.22)

def generate_saw_note(duration, freq, sample_rate=44100, cutoff=1200, resonance=1.2):
    """Rich analog saw bass note with low-pass filter envelope"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    # Bandlimited saw using harmonic additive synthesis
    signal_out = np.zeros_like(t)
    harmonics = min(24, int((sample_rate / 2) / (freq + 1)))
    for h in range(1, harmonics + 1):
        amp = (1.0 / h) * (1.0 if (h % 2 == 1) else 0.8)
        # Low-pass roll-off
        h_freq = h * freq
        lp_mult = 1.0 / (1.0 + (h_freq / cutoff) ** 3.0)
        signal_out += amp * lp_mult * np.sin(2.0 * np.pi * h_freq * t)
    
    # Sub bass oscillator (sine 1 octave down)
    sub = np.sin(2.0 * np.pi * (freq * 0.5) * t) * 0.5
    
    # Amp envelope (snappy decay)
    amp_env = np.clip(t / 0.005, 0, 1) * np.exp(-t * 3.5)
    return (signal_out + sub) * amp_env * 0.5

def generate_brass_stab(duration, chord_freqs, sample_rate=44100):
    """Heavy dystopian cinematic brass horn hit (Hans Zimmer / Santhosh Narayanan style)"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    chord = np.zeros_like(t)
    for f in chord_freqs:
        # Dual detuned saws
        saw1 = signal.sawtooth(2.0 * np.pi * f * t)
        saw2 = signal.sawtooth(2.0 * np.pi * (f * 1.004) * t)
        chord += (saw1 + saw2) * 0.5
    chord /= len(chord_freqs)
    # Filter envelope opening up and closing
    cutoff_env = 800.0 + 2400.0 * np.exp(-t * 4.0)
    # Apply time-varying lowpass filter via simple moving window or butterworth
    b, a = signal.butter(2, 2200 / (sample_rate / 2), btype='low')
    filtered = signal.lfilter(b, a, chord)
    amp_env = np.clip(t / 0.02, 0, 1) * np.exp(-t * 2.2)
    return filtered * amp_env * 0.65

def generate_menu_track():
    """Generate ~45s atmospheric D minor theme for main menu"""
    bpm = 104
    beat_dur = 60.0 / bpm
    bar_dur = beat_dur * 4.0
    total_bars = 20
    total_duration = total_bars * bar_dur
    total_samples = int(total_duration * SAMPLE_RATE)
    
    left = np.zeros(total_samples, dtype=np.float32)
    right = np.zeros(total_samples, dtype=np.float32)
    
    print(f"Synthesizing Menu Track: {total_duration:.2f}s ({bpm} BPM)...")
    
    # D minor notes frequencies
    D1, D2, D3, D4 = 36.71, 73.42, 146.83, 293.66
    Eb3, F3, G3, A3, Bb3, C4 = 155.56, 174.61, 196.00, 220.00, 233.08, 261.63
    
    # 1. Atmospheric Sub Drone (D1 + D2 continuous with slow phasing)
    t_all = np.linspace(0, total_duration, total_samples, endpoint=False)
    sub_drone = (np.sin(2.0 * np.pi * D1 * t_all) * 0.45 + 
                 np.sin(2.0 * np.pi * (D1 * 1.002) * t_all) * 0.35 +
                 np.sin(2.0 * np.pi * D2 * t_all) * 0.25)
    # Modulate drone with slow breathing LFO
    drone_lfo = 0.75 + 0.25 * np.sin(2.0 * np.pi * 0.08 * t_all)
    sub_drone *= drone_lfo
    left += sub_drone * 0.6
    right += sub_drone * 0.6
    
    # 2. Ambient Cyber Pad (D min chords with gentle chorusing)
    chords = [
        [D3, F3, A3],     # D min
        [D3, Eb3, G3],    # D Phrygian color
        [Bb3 * 0.5, D3, F3], # Bb maj
        [A3 * 0.5, C4 * 0.5, Eb3]  # A dim / transition
    ]
    
    pad_samples = int(bar_dur * 2.0 * SAMPLE_RATE)
    t_pad = np.linspace(0, bar_dur * 2.0, pad_samples, endpoint=False)
    pad_env = np.sin(np.pi * np.clip(t_pad / (bar_dur * 2.0), 0, 1)) ** 1.5
    
    for bar_idx in range(0, total_bars, 2):
        chord = chords[(bar_idx // 2) % len(chords)]
        start_samp = int(bar_idx * bar_dur * SAMPLE_RATE)
        end_samp = min(total_samples, start_samp + pad_samples)
        seg_len = end_samp - start_samp
        
        pad_sig = np.zeros(seg_len, dtype=np.float32)
        for f in chord:
            saw1 = signal.sawtooth(2.0 * np.pi * f * t_pad[:seg_len])
            saw2 = signal.sawtooth(2.0 * np.pi * (f * 1.003) * t_pad[:seg_len])
            sine = np.sin(2.0 * np.pi * f * t_pad[:seg_len])
            pad_sig += (saw1 + saw2) * 0.15 + sine * 0.35
            
        b, a = signal.butter(2, 600 / (SAMPLE_RATE / 2), btype='low')
        pad_filt = signal.lfilter(b, a, pad_sig) * pad_env[:seg_len] * 0.45
        
        left[start_samp:end_samp] += pad_filt * 0.7
        right[start_samp:end_samp] += pad_filt * 0.65
        
    # 3. Slow Tribal Pulse Drum on Beats 1 and 3 (Heartbeat of the Wasteland)
    heartbeat = generate_dhol(0.7, SAMPLE_RATE, pitch=62.0, slap=False) * 0.75
    rim_click = generate_hihat(0.12, SAMPLE_RATE, open_hat=False) * 0.3
    
    for bar in range(2, total_bars):
        for beat in range(4):
            beat_time = (bar * 4 + beat) * beat_dur
            s_idx = int(beat_time * SAMPLE_RATE)
            if beat in [0, 2]: # Pulse
                e_idx = min(total_samples, s_idx + len(heartbeat))
                left[s_idx:e_idx] += heartbeat[:e_idx - s_idx] * 0.65
                right[s_idx:e_idx] += heartbeat[:e_idx - s_idx] * 0.65
            elif beat in [1, 3] and bar >= 4: # Faint industrial tick
                e_idx = min(total_samples, s_idx + len(rim_click))
                left[s_idx:e_idx] += rim_click[:e_idx - s_idx] * 0.3
                right[s_idx:e_idx] += rim_click[:e_idx - s_idx] * 0.4
                
    # 4. Modal Bhairava Plucked Motif (D - Eb - F - G - F - Eb - D - A)
    motif_notes = [
        (0.0, D4, 1.2), (1.5, Eb3 * 2, 0.8), (2.5, F3 * 2, 1.0), (4.0, G3 * 2, 1.5),
        (6.0, F3 * 2, 0.8), (7.0, Eb3 * 2, 0.8), (8.0, D4, 2.0), (11.0, A3, 1.8)
    ]
    
    for cycle in range(2):
        base_time = (4 + cycle * 8) * bar_dur
        for offset_beat, note_freq, dur_beats in motif_notes:
            note_time = base_time + offset_beat * beat_dur
            if note_time >= total_duration - 2: continue
            note_dur = dur_beats * beat_dur
            t_n = np.linspace(0, note_dur, int(note_dur * SAMPLE_RATE), endpoint=False)
            
            # Sitar-like plucked string with slight pitch bend up
            bend = np.exp(-t_n * 8.0) * (note_freq * 0.04)
            phase = 2.0 * np.pi * np.cumsum(note_freq + bend) / SAMPLE_RATE
            pluck = (np.sin(phase) + 0.4 * np.sin(2 * phase) + 0.2 * np.sin(3 * phase)) * np.exp(-t_n * 2.8)
            
            s_idx = int(note_time * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(pluck))
            l_len = e_idx - s_idx
            # Pan across stereo
            pan = 0.5 + 0.3 * np.sin(offset_beat)
            left[s_idx:e_idx] += pluck[:l_len] * (1.0 - pan) * 0.55
            right[s_idx:e_idx] += pluck[:l_len] * pan * 0.55
            
    # Normalize with headroom
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-4)
    left = (left / peak) * 0.92
    right = (right / peak) * 0.92
    
    # Smooth loop crossfade (1.2s at beginning and end)
    fade_len = int(1.2 * SAMPLE_RATE)
    fade_in = np.linspace(0, 1, fade_len)
    fade_out = np.linspace(1, 0, fade_len)
    left[:fade_len] = left[:fade_len] * fade_in + left[-fade_len:] * fade_out
    right[:fade_len] = right[:fade_len] * fade_in + right[-fade_len:] * fade_out
    
    return left, right

def generate_bgm_track():
    """Generate ~65s high-energy action runner theme for gameplay (132 BPM)"""
    bpm = 132
    beat_dur = 60.0 / bpm
    bar_dur = beat_dur * 4.0
    total_bars = 36 # ~65.45 seconds
    total_duration = total_bars * bar_dur
    total_samples = int(total_duration * SAMPLE_RATE)
    
    left = np.zeros(total_samples, dtype=np.float32)
    right = np.zeros(total_samples, dtype=np.float32)
    
    print(f"Synthesizing In-Game BGM Track: {total_duration:.2f}s ({bpm} BPM)...")
    
    # Pre-render drum hits
    kick = generate_kick(beat_dur * 0.9, SAMPLE_RATE)
    dhol_bass = generate_dhol(beat_dur * 1.4, SAMPLE_RATE, pitch=68.0, slap=False)
    dhol_slap = generate_dhol(beat_dur * 0.8, SAMPLE_RATE, pitch=110.0, slap=True)
    snare = generate_snare(beat_dur * 0.8, SAMPLE_RATE)
    hat_closed = generate_hihat(0.08, SAMPLE_RATE, open_hat=False)
    hat_open = generate_hihat(0.24, SAMPLE_RATE, open_hat=True)
    
    # D minor / D Phrygian frequencies
    D1, D2, D3, D4 = 36.71, 73.42, 146.83, 293.66
    Eb2, Eb3, Eb4 = 77.78, 155.56, 311.13
    F2, F3, F4 = 87.31, 174.61, 349.23
    G2, G3, G4 = 98.00, 196.00, 392.00
    A2, A3, A4 = 110.00, 220.00, 440.00
    Bb2, Bb3, Bb4 = 116.54, 233.08, 466.16
    C3, C4 = 130.81, 261.63
    
    bass_notes = [D2, D2, D2, Eb2, D2, D2, F2, Eb2, D2, D2, G2, F2, Eb2, D2, C3, D2]
    
    # Loop across all bars
    for bar in range(total_bars):
        bar_start_time = bar * bar_dur
        is_intro = bar < 4
        is_drop = (bar >= 12 and bar < 28) or (bar >= 32)
        has_full_drums = bar >= 4
        has_brass = bar in [8, 9, 10, 11, 20, 21, 22, 23, 28, 29, 30, 31]
        
        # 1. Kick & Snare Drums
        for beat in range(4):
            t_beat = bar_start_time + beat * beat_dur
            s_idx = int(t_beat * SAMPLE_RATE)
            
            # Kick on 4-on-the-floor during active sections
            if has_full_drums:
                e_idx = min(total_samples, s_idx + len(kick))
                left[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.8
                right[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.8
            elif is_intro and beat in [0, 2]:
                e_idx = min(total_samples, s_idx + len(kick))
                left[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.6
                right[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.6
                
            # Snare on 2 and 4
            if has_full_drums and beat in [1, 3]:
                e_idx = min(total_samples, s_idx + len(snare))
                left[s_idx:e_idx] += snare[:e_idx - s_idx] * 0.65
                right[s_idx:e_idx] += snare[:e_idx - s_idx] * 0.65
                
        # 2. Indian Dhol & Taiko Syncopated Percussion (Kalki battle rhythm)
        # 16th note subdivisions: 0, 3, 6, 8, 11, 14
        if has_full_drums:
            dhol_pattern = [(0, dhol_bass, 0.9), (3, dhol_slap, 0.6), (6, dhol_bass, 0.75), 
                            (8, dhol_bass, 0.85), (10, dhol_slap, 0.7), (12, dhol_bass, 0.8), (14, dhol_slap, 0.8)]
            for step, sample, vol in dhol_pattern:
                t_step = bar_start_time + (step / 16.0) * bar_dur
                s_idx = int(t_step * SAMPLE_RATE)
                e_idx = min(total_samples, s_idx + len(sample))
                mult = vol * (1.15 if is_drop else 0.85)
                left[s_idx:e_idx] += sample[:e_idx - s_idx] * mult * 0.7
                right[s_idx:e_idx] += sample[:e_idx - s_idx] * mult * 0.75
                
        # 3. Hi-Hats (16th notes with velocity swing)
        if has_full_drums:
            for step in range(16):
                t_step = bar_start_time + (step / 16.0) * bar_dur
                s_idx = int(t_step * SAMPLE_RATE)
                sample = hat_open if (step % 4 == 2) else hat_closed
                vol = 0.4 if (step % 4 == 0) else (0.5 if (step % 4 == 2) else 0.25)
                e_idx = min(total_samples, s_idx + len(sample))
                pan = 0.35 if (step % 2 == 0) else 0.65
                left[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * (1.0 - pan)
                right[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * pan
                
        # 4. Driving Cyber Saw-Bass (16th note rolling arpeggio)
        if bar >= 2:
            step_dur = bar_dur / 16.0
            for step in range(16):
                freq = bass_notes[step % len(bass_notes)]
                if is_drop and step % 4 == 0:
                    freq = D1 * 2 # Heavy sub root
                note = generate_saw_note(step_dur * 1.1, freq, SAMPLE_RATE, cutoff=1600 if is_drop else 950)
                t_step = bar_start_time + step * step_dur
                s_idx = int(t_step * SAMPLE_RATE)
                e_idx = min(total_samples, s_idx + len(note))
                vol = 0.7 if is_drop else 0.5
                left[s_idx:e_idx] += note[:e_idx - s_idx] * vol
                right[s_idx:e_idx] += note[:e_idx - s_idx] * vol
                
        # 5. Cinematic Cyber Brass Horn Stabs
        if has_brass:
            brass_chord = [D3, A3, D4] if bar % 2 == 0 else [Eb3, Bb3, Eb4]
            stab = generate_brass_stab(bar_dur * 0.45, brass_chord, SAMPLE_RATE)
            s_idx = int(bar_start_time * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(stab))
            left[s_idx:e_idx] += stab[:e_idx - s_idx] * 0.75
            right[s_idx:e_idx] += stab[:e_idx - s_idx] * 0.75
            
        # 6. High-Tech Arpeggiator Lead Synth (Flying over the Complex)
        if bar >= 8:
            lead_scale = [D4, F3 * 2, G3 * 2, A3 * 2, C4 * 2, D4 * 2]
            step_dur = bar_dur / 16.0
            for step in range(16):
                # Arp pattern
                idx = (step * 3 + bar) % len(lead_scale)
                f_lead = lead_scale[idx]
                t_l = np.linspace(0, step_dur * 0.9, int(step_dur * 0.9 * SAMPLE_RATE), endpoint=False)
                lead_note = (signal.sawtooth(2 * np.pi * f_lead * t_l) * 0.3 + 
                             np.sin(2 * np.pi * f_lead * t_l) * 0.5) * np.exp(-t_l * 18.0)
                t_step = bar_start_time + step * step_dur
                s_idx = int(t_step * SAMPLE_RATE)
                e_idx = min(total_samples, s_idx + len(lead_note))
                pan = 0.5 + 0.35 * np.sin(step * 0.8)
                left[s_idx:e_idx] += lead_note[:e_idx - s_idx] * (1.0 - pan) * 0.32
                right[s_idx:e_idx] += lead_note[:e_idx - s_idx] * pan * 0.32
                
    # Normalize with headroom
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-4)
    left = (left / peak) * 0.95
    right = (right / peak) * 0.95
    
    # Smooth loop crossfade (1.0s at beginning and end)
    fade_len = int(1.0 * SAMPLE_RATE)
    fade_in = np.linspace(0, 1, fade_len)
    fade_out = np.linspace(1, 0, fade_len)
    left[:fade_len] = left[:fade_len] * fade_in + left[-fade_len:] * fade_out
    right[:fade_len] = right[:fade_len] * fade_in + right[-fade_len:] * fade_out
    
    return left, right

def save_wav(filename, left, right):
    stereo = np.empty((len(left) * 2,), dtype=np.int16)
    left_16 = np.clip(left * 32767.0, -32767.0, 32767.0).astype(np.int16)
    right_16 = np.clip(right * 32767.0, -32767.0, 32767.0).astype(np.int16)
    stereo[0::2] = left_16
    stereo[1::2] = right_16
    
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(stereo.tobytes())
    print(f"WAV saved: {filename} ({os.path.getsize(filename)} bytes)")

def convert_to_mp3_and_m4a(wav_path, mp3_path, m4a_path):
    # Lame MP3
    cmd_lame = ["/opt/homebrew/bin/lame", "-b", "256", "-q", "2", wav_path, mp3_path]
    print(f"Running LAME: {' '.join(cmd_lame)}")
    res = subprocess.run(cmd_lame, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Lame error: {res.stderr}")
    else:
        print(f"MP3 created: {mp3_path} ({os.path.getsize(mp3_path)} bytes)")
        
    # Apple AAC M4A
    cmd_m4a = ["/usr/bin/afconvert", "-f", "m4af", "-d", "aac", "-b", "256000", wav_path, m4a_path]
    print(f"Running afconvert: {' '.join(cmd_m4a)}")
    res_m4a = subprocess.run(cmd_m4a, capture_output=True, text=True)
    if res_m4a.returncode != 0:
        print(f"afconvert error: {res_m4a.stderr}")
    else:
        print(f"M4A created: {m4a_path} ({os.path.getsize(m4a_path)} bytes)")

if __name__ == "__main__":
    audio_dir = "/Users/srr11906/Documents/Projects/Prabhas Movie Runner/Complex_Runner/assets/audio"
    os.makedirs(audio_dir, exist_ok=True)
    
    # 1. Synthesize Menu Theme
    menu_left, menu_right = generate_menu_track()
    menu_wav = "/tmp/menu_synth.wav"
    save_wav(menu_wav, menu_left, menu_right)
    convert_to_mp3_and_m4a(menu_wav, os.path.join(audio_dir, "menu.mp3"), os.path.join(audio_dir, "menu.m4a"))
    
    # 2. Synthesize In-Game Action BGM
    bgm_left, bgm_right = generate_bgm_track()
    bgm_wav = "/tmp/bgm_synth.wav"
    save_wav(bgm_wav, bgm_left, bgm_right)
    convert_to_mp3_and_m4a(bgm_wav, os.path.join(audio_dir, "bgm.mp3"), os.path.join(audio_dir, "bgm.m4a"))
    
    print("Soundtrack synthesis successfully complete!")
