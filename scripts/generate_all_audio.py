import os
import math
import wave
import struct
import subprocess
import numpy as np
from scipy import signal

SAMPLE_RATE = 44100

def soft_clip(x, threshold=0.75):
    """Tube-style soft saturation limiter for maximum punchiness without harsh distortion"""
    out = np.copy(x)
    mask = np.abs(x) > threshold
    out[mask] = np.sign(x[mask]) * (threshold + (1.0 - threshold) * np.tanh((np.abs(x[mask]) - threshold) / (1.0 - threshold)))
    return out

def generate_punchy_kick(duration=0.38, sample_rate=44100):
    """Heavy modern punchy sub-kick drum (90Hz punch + 42Hz sub sustain)"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    freq_env = 42.0 + 130.0 * np.exp(-t * 36.0)
    phase = 2.0 * np.pi * np.cumsum(freq_env) / sample_rate
    sub = np.sin(phase)
    # Beater click transient
    click = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 220.0) * 0.4
    # Punch harmonic
    punch = np.sin(2.0 * phase) * 0.25 * np.exp(-t * 28.0)
    body = (sub + punch) * np.exp(-t * 8.5) + click
    return body * 1.1

def generate_driving_dhol(duration=0.32, sample_rate=44100, pitch=72.0, slap=False):
    """Continuous energetic Indian Dhol hit with thick resonant body"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    start_p = pitch * (2.6 if slap else 1.9)
    freq_env = pitch + (start_p - pitch) * np.exp(-t * (55.0 if slap else 32.0))
    phase = 2.0 * np.pi * np.cumsum(freq_env) / sample_rate
    base = np.sin(phase) + 0.35 * np.sin(2.0 * phase) + 0.18 * np.sin(3.0 * phase)
    amp = np.exp(-t * (16.0 if slap else 9.5))
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * (95.0 if slap else 45.0)) * (0.5 if slap else 0.3)
    return (base * amp + noise) * 1.05

def generate_punchy_snare(duration=0.28, sample_rate=44100):
    """Crisp, punchy cyber-industrial snare"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    tonal = np.sin(2.0 * np.pi * (210.0 + 110.0 * np.exp(-t * 45.0)) * t) * np.exp(-t * 24.0)
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * 18.0)
    return (tonal * 0.45 + noise * 0.65) * 1.0

def generate_rolling_bass(duration, freq, sample_rate=44100):
    """Aggressive 16th-note saw bass note with heavy sub-octave punch"""
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    # Dual slightly detuned saw waves
    saw1 = signal.sawtooth(2.0 * np.pi * freq * t)
    saw2 = signal.sawtooth(2.0 * np.pi * (freq * 1.004) * t)
    saw = (saw1 + saw2) * 0.5
    # Sub octave sine
    sub = np.sin(2.0 * np.pi * (freq * 0.5) * t) * 0.75
    # Lowpass filter
    b, a = signal.butter(2, min(1800, freq * 8) / (sample_rate / 2), btype='low')
    saw_filt = signal.lfilter(b, a, saw)
    amp = np.clip(t / 0.004, 0, 1) * np.exp(-t * 4.2)
    return (saw_filt * 0.6 + sub * 0.7) * amp * 0.95

def generate_hihat(duration=0.07, sample_rate=44100, open_hat=False):
    t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
    decay = 22.0 if open_hat else 75.0
    noise = np.random.uniform(-1, 1, len(t)) * np.exp(-t * decay)
    b, a = signal.butter(2, 7000 / (sample_rate / 2), btype='high')
    return signal.lfilter(b, a, noise) * (0.42 if open_hat else 0.3)

def generate_continuous_bgm():
    """Synthesize high-octane 134 BPM runner soundtrack with continuous, non-stop beats"""
    bpm = 134
    beat_dur = 60.0 / bpm
    bar_dur = beat_dur * 4.0
    total_bars = 36 # ~64.5s
    total_duration = total_bars * bar_dur
    total_samples = int(total_duration * SAMPLE_RATE)
    
    left = np.zeros(total_samples, dtype=np.float32)
    right = np.zeros(total_samples, dtype=np.float32)
    
    print(f"Synthesizing Continuous High-Energy BGM: {total_duration:.2f}s ({bpm} BPM)...")
    
    kick = generate_punchy_kick(beat_dur * 0.85)
    dhol_bass = generate_driving_dhol(beat_dur * 0.9, pitch=70.0, slap=False)
    dhol_slap = generate_driving_dhol(beat_dur * 0.6, pitch=115.0, slap=True)
    snare = generate_punchy_snare(beat_dur * 0.75)
    hat_closed = generate_hihat(0.06, open_hat=False)
    hat_open = generate_hihat(0.22, open_hat=True)
    
    # D minor / D Phrygian frequencies
    D1, D2, D3, D4 = 36.71, 73.42, 146.83, 293.66
    Eb2, Eb3 = 77.78, 155.56
    F2, F3 = 87.31, 174.61
    G2, G3 = 98.00, 196.00
    A2, A3 = 110.00, 220.00
    Bb2, Bb3 = 116.54, 233.08
    C3, C4 = 130.81, 261.63
    
    # Relentless 16th-note bass sequence
    bass_groove = [
        D2, D2, D2, Eb2,   D2, D2, F2, Eb2,
        D2, D2, G2, F2,    Eb2, D2, C3, D2
    ]
    step_dur = bar_dur / 16.0
    
    for bar in range(total_bars):
        bar_start_time = bar * bar_dur
        is_breakdown = False # CONTINUOUS BEATS - NEVER STOP!
        
        # 1. Continuous 4-on-the-Floor Kick + 16th Offbeat Ghost Kicks
        for beat in range(4):
            # Main beat
            t_beat = bar_start_time + beat * beat_dur
            s_idx = int(t_beat * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(kick))
            left[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.92
            right[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.92
            
            # Snare on 2 and 4
            if beat in [1, 3]:
                e_snare = min(total_samples, s_idx + len(snare))
                left[s_idx:e_snare] += snare[:e_snare - s_idx] * 0.85
                right[s_idx:e_snare] += snare[:e_snare - s_idx] * 0.85
                
        # Extra syncopated kick hits on steps 6, 14 for massive drive
        for extra_step in [6, 14]:
            t_extra = bar_start_time + (extra_step / 16.0) * bar_dur
            s_idx = int(t_extra * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(kick))
            left[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.65
            right[s_idx:e_idx] += kick[:e_idx - s_idx] * 0.65
            
        # 2. Continuous Indian Dhol & Taiko Syncopated Battle Rhythm
        # Steps: 0 (bass), 2 (tap), 3 (slap), 6 (bass), 8 (bass), 10 (slap), 12 (bass), 14 (slap), 15 (roll)
        dhol_hits = [
            (0, dhol_bass, 0.95),
            (2, dhol_slap, 0.55),
            (3, dhol_slap, 0.85),
            (6, dhol_bass, 0.80),
            (8, dhol_bass, 0.95),
            (10, dhol_slap, 0.85),
            (12, dhol_bass, 0.90),
            (14, dhol_slap, 0.90),
            (15, dhol_slap, 0.60)
        ]
        for step, sample, vol in dhol_hits:
            t_step = bar_start_time + (step / 16.0) * bar_dur
            s_idx = int(t_step * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(sample))
            left[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * 0.85
            right[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * 0.90
            
        # 3. Continuous 16th Hi-Hats & Shakers (driving momentum)
        for step in range(16):
            t_step = bar_start_time + step * step_dur
            s_idx = int(t_step * SAMPLE_RATE)
            is_upbeat = (step % 4 == 2)
            sample = hat_open if is_upbeat else hat_closed
            vol = 0.55 if is_upbeat else (0.42 if step % 2 == 0 else 0.28)
            e_idx = min(total_samples, s_idx + len(sample))
            pan = 0.4 if step % 2 == 0 else 0.6
            left[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * (1.0 - pan)
            right[s_idx:e_idx] += sample[:e_idx - s_idx] * vol * pan
            
        # 4. Continuous Rolling Saw-Bassline (Every single 16th note!)
        for step in range(16):
            freq = bass_groove[step % len(bass_groove)]
            # Add heavy sub drop on step 0
            if step % 8 == 0:
                freq = D1 * 2
            note = generate_rolling_bass(step_dur * 1.05, freq, SAMPLE_RATE)
            t_step = bar_start_time + step * step_dur
            s_idx = int(t_step * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(note))
            left[s_idx:e_idx] += note[:e_idx - s_idx] * 0.85
            right[s_idx:e_idx] += note[:e_idx - s_idx] * 0.85
            
        # 5. Epic Cyber Horn Brass Stabs on phrases
        if bar % 4 in [0, 2]:
            chord = [D3, A3, D4] if bar % 2 == 0 else [Eb3, Bb3, Eb3 * 2]
            t_stab = np.linspace(0, bar_dur * 0.4, int(bar_dur * 0.4 * SAMPLE_RATE), endpoint=False)
            stab_sig = np.zeros_like(t_stab)
            for f in chord:
                stab_sig += signal.sawtooth(2 * np.pi * f * t_stab) * 0.4
            b, a = signal.butter(2, 2400 / (SAMPLE_RATE / 2), btype='low')
            stab_filt = signal.lfilter(b, a, stab_sig) * np.exp(-t_stab * 3.5)
            s_idx = int(bar_start_time * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(stab_filt))
            left[s_idx:e_idx] += stab_filt[:e_idx - s_idx] * 0.75
            right[s_idx:e_idx] += stab_filt[:e_idx - s_idx] * 0.75
            
        # 6. High Energy Arpeggio Lead
        lead_scale = [D4, F3 * 2, G3 * 2, A3 * 2, C4 * 2, D4 * 2]
        for step in range(16):
            f_lead = lead_scale[(step * 3 + bar * 2) % len(lead_scale)]
            t_l = np.linspace(0, step_dur * 0.85, int(step_dur * 0.85 * SAMPLE_RATE), endpoint=False)
            lead = np.sin(2 * np.pi * f_lead * t_l) * np.exp(-t_l * 20.0)
            t_step = bar_start_time + step * step_dur
            s_idx = int(t_step * SAMPLE_RATE)
            e_idx = min(total_samples, s_idx + len(lead))
            pan = 0.5 + 0.35 * np.sin(step * 0.9)
            left[s_idx:e_idx] += lead[:e_idx - s_idx] * (1.0 - pan) * 0.35
            right[s_idx:e_idx] += lead[:e_idx - s_idx] * pan * 0.35
            
    # Soft saturation limiting for powerful punch and commercial game loudness
    left = soft_clip(left, threshold=0.7)
    right = soft_clip(right, threshold=0.7)
    
    # Peak normalization to -0.1 dB
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-4)
    left = (left / peak) * 0.98
    right = (right / peak) * 0.98
    
    # Seamless loop crossfade (0.8s)
    fade_len = int(0.8 * SAMPLE_RATE)
    fade_in = np.linspace(0, 1, fade_len)
    fade_out = np.linspace(1, 0, fade_len)
    left[:fade_len] = left[:fade_len] * fade_in + left[-fade_len:] * fade_out
    right[:fade_len] = right[:fade_len] * fade_in + right[-fade_len:] * fade_out
    
    return left, right

def generate_train_horn_sound():
    """Heavy industrial locomotive warning horn with reverberant stereo blast"""
    duration = 1.6
    total_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, total_samples, endpoint=False)
    
    # Dual locomotive horn chords: 155 Hz (Eb3) and 233 Hz (Bb3) with 311 Hz harmonic
    f1, f2, f3 = 155.56, 233.08, 311.13
    
    # Slight pitch bend down as air pressure drops
    bend = np.exp(-t * 2.5) * 4.0
    
    # Dual detuned saw waves for thick industrial roar
    h1 = (signal.sawtooth(2 * np.pi * (f1 - bend) * t) + signal.sawtooth(2 * np.pi * (f1 * 1.003 - bend) * t)) * 0.5
    h2 = (signal.sawtooth(2 * np.pi * (f2 - bend) * t) + signal.sawtooth(2 * np.pi * (f2 * 1.004 - bend) * t)) * 0.4
    h3 = signal.sawtooth(2 * np.pi * (f3 - bend) * t) * 0.25
    
    raw = h1 + h2 + h3
    
    # Bandpass filter for authentic metal acoustic horn resonance
    b, a = signal.butter(2, [350 / (SAMPLE_RATE / 2), 2200 / (SAMPLE_RATE / 2)], btype='bandpass')
    filtered = signal.lfilter(b, a, raw)
    
    # Punchy attack, sustained blast, smooth echo decay
    amp = np.clip(t / 0.04, 0, 1) * np.where(t < 0.9, 1.0, np.exp(-(t - 0.9) * 4.5))
    horn = filtered * amp * 0.95
    
    # Reverb tail
    reverb = np.zeros_like(horn)
    delays = [int(0.045 * SAMPLE_RATE), int(0.082 * SAMPLE_RATE), int(0.13 * SAMPLE_RATE)]
    decays = [0.45, 0.32, 0.22]
    for d, dec in zip(delays, decays):
        reverb[d:] += horn[:-d] * dec
        
    left = horn + reverb * 0.6
    right = horn + np.roll(reverb, int(0.015 * SAMPLE_RATE)) * 0.6
    
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-4)
    return (left / peak) * 0.95, (right / peak) * 0.95

def generate_train_pass_sound():
    """Heavy rushing train flyby: 45Hz sub-bass roar, metal rail friction, and Doppler whoosh"""
    duration = 2.4
    total_samples = int(duration * SAMPLE_RATE)
    t = np.linspace(0, duration, total_samples, endpoint=False)
    
    # Peak passage at t = 1.0s
    dist = (t - 1.0) * 25.0 # meters
    vol_envelope = 1.0 / (1.0 + (dist / 8.0) ** 2.0)
    
    # 1. Low sub rumble (diesel/maglev engine 42Hz + 84Hz)
    sub = (np.sin(2 * np.pi * 42.0 * t) + 0.4 * np.sin(2 * np.pi * 84.0 * t)) * vol_envelope
    
    # 2. White noise wind rush & track friction
    noise = np.random.uniform(-1, 1, total_samples)
    b, a = signal.butter(2, [180 / (SAMPLE_RATE / 2), 2800 / (SAMPLE_RATE / 2)], btype='bandpass')
    whoosh = signal.lfilter(b, a, noise) * vol_envelope
    
    # 3. Rhythmic wheel/maglev track clatter pulses (12 Hz)
    clatter_pulse = (np.sin(2 * np.pi * 12.0 * t) > 0.6).astype(np.float32)
    clatter = clatter_pulse * np.random.uniform(-1, 1, total_samples) * 0.35 * vol_envelope
    
    # Combine
    combined = sub * 0.65 + whoosh * 0.75 + clatter * 0.35
    
    # Stereo panning from front to back
    pan = np.clip(0.2 + 0.6 * (t / duration), 0.1, 0.9)
    left = combined * (1.0 - pan)
    right = combined * pan
    
    peak = max(np.max(np.abs(left)), np.max(np.abs(right)), 1e-4)
    return (left / peak) * 0.95, (right / peak) * 0.95

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

def convert_to_mp3_and_m4a(wav_path, mp3_path, m4a_path):
    subprocess.run(["/opt/homebrew/bin/lame", "-b", "256", "-q", "2", wav_path, mp3_path], capture_output=True)
    subprocess.run(["/usr/bin/afconvert", "-f", "m4af", "-d", "aac", "-b", "256000", wav_path, m4a_path], capture_output=True)
    print(f"Rendered: {os.path.basename(mp3_path)} ({os.path.getsize(mp3_path)} bytes) & {os.path.basename(m4a_path)} ({os.path.getsize(m4a_path)} bytes)")

if __name__ == "__main__":
    audio_dir = "/Users/srr11906/Documents/Projects/Prabhas Movie Runner/Complex_Runner/assets/audio"
    root_dir = "/Users/srr11906/Documents/Projects/Prabhas Movie Runner/Complex_Runner"
    os.makedirs(audio_dir, exist_ok=True)
    
    # 1. BGM Track
    bgm_l, bgm_r = generate_continuous_bgm()
    save_wav("/tmp/bgm_punchy.wav", bgm_l, bgm_r)
    convert_to_mp3_and_m4a("/tmp/bgm_punchy.wav", os.path.join(audio_dir, "bgm.mp3"), os.path.join(audio_dir, "bgm.m4a"))
    convert_to_mp3_and_m4a("/tmp/bgm_punchy.wav", os.path.join(root_dir, "bgm.mp3"), os.path.join(root_dir, "bgm.m4a"))
    
    # 2. Train Horn
    horn_l, horn_r = generate_train_horn_sound()
    save_wav("/tmp/train_horn.wav", horn_l, horn_r)
    convert_to_mp3_and_m4a("/tmp/train_horn.wav", os.path.join(audio_dir, "train_horn.mp3"), os.path.join(audio_dir, "train_horn.m4a"))
    convert_to_mp3_and_m4a("/tmp/train_horn.wav", os.path.join(root_dir, "train_horn.mp3"), os.path.join(root_dir, "train_horn.m4a"))
    
    # 3. Train Pass / Rumble
    pass_l, pass_r = generate_train_pass_sound()
    save_wav("/tmp/train_pass.wav", pass_l, pass_r)
    convert_to_mp3_and_m4a("/tmp/train_pass.wav", os.path.join(audio_dir, "train_pass.mp3"), os.path.join(audio_dir, "train_pass.m4a"))
    convert_to_mp3_and_m4a("/tmp/train_pass.wav", os.path.join(root_dir, "train_pass.mp3"), os.path.join(root_dir, "train_pass.m4a"))
    
    print("ALL AUDIO SYNTHESIS COMPLETED SUCCESSFULLY!")
