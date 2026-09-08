/**
 * Procedural 3-second harmonic chime synthesizer for Pomodoro completion.
 * Zero external audio files, works offline, 100% client-side Web Audio API.
 */
class PomodoroAlarmEngine {
  private ctx: AudioContext | null = null;
  private currentGain: GainNode | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playAlarm(volume = 0.7) {
    if (typeof window === "undefined") return;

    try {
      const ctx = this.initContext();
      this.stop();

      const masterGain = ctx.createGain();
      const clampedVol = Math.max(0, Math.min(1, volume));
      masterGain.gain.setValueAtTime(clampedVol * 0.4, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.currentGain = masterGain;

      // 4-Note Marimba / Zen Bell Harmonic Arpeggio: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, time: 0.0, duration: 2.8 },
        { freq: 659.25, time: 0.4, duration: 2.4 },
        { freq: 783.99, time: 0.8, duration: 2.0 },
        { freq: 1046.5, time: 1.2, duration: 1.8 },
      ];

      notes.forEach(({ freq, time, duration }) => {
        const startTime = ctx.currentTime + time;

        // Primary fundamental bell tone
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        // Shimmer overtone (2nd harmonic)
        const overtone = ctx.createOscillator();
        overtone.type = "sine";
        overtone.frequency.setValueAtTime(freq * 2.01, startTime);

        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.5, startTime + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        const overtoneGain = ctx.createGain();
        overtoneGain.gain.setValueAtTime(0, startTime);
        overtoneGain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);

        osc.connect(noteGain);
        overtone.connect(overtoneGain);

        noteGain.connect(masterGain);
        overtoneGain.connect(masterGain);

        osc.start(startTime);
        overtone.start(startTime);

        osc.stop(startTime + duration);
        overtone.stop(startTime + duration);
      });

      // Master fadeout at exactly 3 seconds
      masterGain.gain.setValueAtTime(clampedVol * 0.4, ctx.currentTime + 2.7);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0);

      this.timeoutId = setTimeout(() => {
        this.stop();
      }, 3100);
    } catch {
      // AudioContext could be blocked by browser autoplay policy if no interaction occurred
    }
  }

  public stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.currentGain) {
      try {
        this.currentGain.disconnect();
      } catch {}
      this.currentGain = null;
    }
  }
}

export const pomodoroAlarm = new PomodoroAlarmEngine();
