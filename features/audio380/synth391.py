#!/usr/bin/env python3
"""391: deterministic, original weapon sound effects for NOVA (no third-party samples).

Each weapon gets its own character: a punchy three-round machine-gun burst, a sharp sniper crack
with echo, deep cannon and explosion booms, a missile whoosh, laser plasma, crackling tesla arcs.
Every clip has a short fade-in/out so nothing clicks. Output replaces the weapon keys in clips.json
(victory/defeat/heal are kept). Run: python3 features/audio380/synth391.py
"""
import base64, json, os, subprocess, tempfile, wave
import numpy as np
from scipy.signal import lfilter

SR = 44100
rng = np.random.default_rng(391)
HERE = os.path.dirname(os.path.abspath(__file__))


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack, decay):
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(0, x - attack) / decay)


def noise(sec):
    return rng.standard_normal(int(SR * sec))


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    return lfilter([1 - a], [1, -a], x)


def lp(x, cutoff, order=2):
    for _ in range(order):
        x = onepole_lp(x, cutoff)
    return x


def hp(x, cutoff):
    return x - lp(x, cutoff, 1)


def bp(x, lo, hi):
    return lp(hp(x, lo), hi, 2)


def sweep(sec, f0, f1, curve=3.0):
    x = t(sec); k = (x / sec) ** (1 / curve)
    f = f0 + (f1 - f0) * k
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def place(out, sig, at):
    i = int(at * SR); j = min(len(out), i + len(sig))
    out[i:j] += sig[: j - i]


def finish(x, peak=0.89):
    n = len(x); fade_in = int(SR * 0.002); fade_out = int(SR * 0.03)
    x[:fade_in] *= np.linspace(0, 1, fade_in)
    x[-fade_out:] *= np.linspace(1, 0, fade_out)
    x = np.tanh(x * 1.2) / np.tanh(1.2)  # gentle saturation adds punch without hard clipping
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def echo(x, delays, gains, cutoff=2500):
    out = np.zeros(len(x) + int(SR * max(delays)) + 1)
    out[: len(x)] += x
    for d, g in zip(delays, gains):
        place(out, lp(x, cutoff) * g, d)
    return out


def gunshot(body_hz=(170, 55), crack=1.0, body=1.0, tail=0.22):
    s = np.zeros(int(SR * 0.32))
    n = len(s)
    thump = sweep(0.09, body_hz[0], body_hz[1]) * env(int(SR * 0.09), 0.001, 0.035)
    place(s, thump * 0.9 * body, 0)
    c = bp(noise(0.05), 1800, 7000) * env(int(SR * 0.05), 0.0004, 0.010)
    place(s, c * 1.1 * crack, 0)
    pop = lp(noise(0.12), 1300) * env(int(SR * 0.12), 0.001, 0.045)
    place(s, pop * 1.4, 0)
    rev = lp(noise(0.3), 1600) * env(int(SR * 0.3), 0.004, 0.09) * tail
    place(s, rev, 0.006)
    clack = np.sin(2 * np.pi * 3100 * t(0.02)) * env(int(SR * 0.02), 0.0005, 0.004) * 0.18
    place(s, clack, 0.03)
    return s[:n]


def machine():
    out = np.zeros(int(SR * 0.46))
    for i, at in enumerate([0, 0.078, 0.156]):
        g = gunshot(body_hz=(175 - i * 6, 52), crack=1 - i * 0.08)
        place(out, g * (1 - i * 0.07), at)
    return finish(out)


def sniper():
    s = np.zeros(int(SR * 0.5))
    crack = bp(noise(0.012), 2500, 12000) * env(int(SR * 0.012), 0.0002, 0.003) * 1.6
    place(s, crack, 0)
    boom = sweep(0.22, 140, 38) * env(int(SR * 0.22), 0.001, 0.07)
    place(s, boom * 1.1, 0.002)
    body = lp(noise(0.25), 2200) * env(int(SR * 0.25), 0.001, 0.05)
    place(s, body * 1.2, 0.001)
    return finish(echo(s, [0.17, 0.34, 0.55], [0.32, 0.17, 0.08], 1800))


def boom(sec=1.1, sub=(75, 28), rumble=0.35, crackle=0.0, bright=900):
    s = np.zeros(int(SR * sec))
    place(s, sweep(0.45, sub[0], sub[1]) * env(int(SR * 0.45), 0.002, 0.16) * 1.3, 0)
    place(s, lp(noise(sec), bright) * env(int(SR * sec), 0.003, rumble) * 1.6, 0)
    place(s, bp(noise(0.03), 900, 5000) * env(int(SR * 0.03), 0.0005, 0.008) * 0.8, 0)
    if crackle:
        for _ in range(int(40 * crackle)):
            at = rng.uniform(0.05, sec * 0.7)
            k = bp(noise(0.01), 1500, 6000) * env(int(SR * 0.01), 0.0003, 0.003) * rng.uniform(0.1, 0.35) * np.exp(-at / (sec * 0.35))
            place(s, k, at)
    return s


def cannon():
    s = boom(0.9, (90, 32), 0.22, 0, 1100)
    place(s, gunshot((120, 45), crack=0.6, tail=0.4) * 0.6, 0)
    return finish(s)


def grenade():
    s = np.zeros(int(SR * 0.7))
    place(s, sweep(0.07, 420, 140) * env(int(SR * 0.07), 0.001, 0.025) * 0.7, 0)  # launcher bloop
    place(s, boom(0.55, (95, 40), 0.12, 0.3, 1400) * 0.8, 0.12)
    return finish(s)


def explosion():
    return finish(boom(1.6, (70, 24), 0.45, 1.0, 800))


def bomb():
    s = np.zeros(int(SR * 1.3))
    place(s, boom(1.2, (80, 26), 0.32, 0.6, 1000), 0)
    return finish(s)


def impact():
    s = np.zeros(int(SR * 0.3))
    place(s, sweep(0.12, 160, 70) * env(int(SR * 0.12), 0.001, 0.035), 0)
    place(s, lp(noise(0.2), 2000) * env(int(SR * 0.2), 0.001, 0.04) * 0.9, 0)
    return finish(s, 0.8)


def missile():
    sec = 0.85; n = int(SR * sec); x = t(sec)
    hiss = noise(sec)
    # moving band: sweep the band-pass by blending two filtered versions
    low, high = bp(hiss, 500, 1600), bp(hiss, 1600, 5200)
    k = np.clip(x / 0.5, 0, 1)
    w = (low * (1 - k) + high * k) * np.minimum(1, x / 0.08) * np.exp(-np.maximum(0, x - 0.25) / 0.22)
    s = w * 1.3
    place(s, sweep(0.12, 140, 60) * env(int(SR * 0.12), 0.001, 0.04) * 0.9, 0)
    place(s, lp(noise(0.06), 1500) * env(int(SR * 0.06), 0.001, 0.02) * 0.8, 0)
    return finish(s)


def plasma():
    sec = 0.32; x = t(sec)
    f = 1700 * np.exp(-x / 0.07) + 260
    vib = 1 + 0.06 * np.sin(2 * np.pi * 38 * x)
    ph = np.cumsum(f * vib) / SR
    tone = 0.6 * np.sin(2 * np.pi * ph) + 0.25 * np.sign(np.sin(2 * np.pi * ph * 0.5))
    s = lp(tone, 4200, 1) * env(len(x), 0.002, 0.09)
    s += bp(noise(sec), 2500, 9000) * env(len(x), 0.001, 0.025) * 0.35
    return finish(echo(s, [0.09], [0.22], 3000))


def tesla(heavy=False):
    sec = 0.55 if heavy else 0.42; x = t(sec); n = len(x)
    gate = np.zeros(n); i = 0
    while i < n:
        on = int(SR * rng.uniform(0.004, 0.018)); off = int(SR * rng.uniform(0.001, 0.012))
        gate[i:i + on] = rng.uniform(0.5, 1.0); i += on + off
    arc = bp(noise(sec), 1800, 9000) * lp(gate, 400, 1)
    buzz = np.sign(np.sin(2 * np.pi * 110 * x)) * 0.18 + np.sin(2 * np.pi * 220 * x) * 0.12
    s = (arc * 1.3 + lp(buzz, 1500, 1)) * env(n, 0.003, 0.14 if heavy else 0.1)
    place(s, bp(noise(0.02), 3000, 12000) * env(int(SR * 0.02), 0.0003, 0.004) * 1.2, 0)
    if heavy:
        place(s, sweep(0.2, 110, 40) * env(int(SR * 0.2), 0.001, 0.06) * 0.9, 0)
    return finish(s)


def energy():
    s = np.zeros(int(SR * 0.9))
    x = t(0.16)
    charge = np.sin(2 * np.pi * np.cumsum(500 + 2600 * (x / 0.16) ** 2) / SR) * np.minimum(1, x / 0.16) * 0.35
    place(s, charge, 0)
    place(s, boom(0.7, (110, 40), 0.16, 0, 1600) * 0.9, 0.15)
    place(s, plasma() * 0.5, 0.15)
    return finish(s)


def mp3(x):
    with tempfile.TemporaryDirectory() as d:
        wav = os.path.join(d, 'a.wav'); out = os.path.join(d, 'a.mp3')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
            w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '80k', '-map_metadata', '-1', '-id3v2_version', '0', out], check=True)
        return open(out, 'rb').read()


SOUNDS = {
    'machine': machine, 'sniper': sniper, 'cannon': cannon, 'grenade': grenade,
    'missile': missile, 'missileImpact': explosion, 'bomb': bomb, 'impact': impact,
    'plasma': plasma, 'tesla': tesla, 'shock': lambda: tesla(True), 'energy': energy,
}

if __name__ == '__main__':
    path = os.path.join(HERE, 'clips.json')
    clips = json.load(open(path))
    for key, fn in SOUNDS.items():
        data = mp3(fn())
        clips[key] = base64.b64encode(data).decode()
        print(key, len(data), 'bytes')
    json.dump(clips, open(path, 'w'))
