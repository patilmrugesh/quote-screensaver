/**
 * Procedural Web Audio sound effects for tasks, habit completion, and willpower shield.
 * 100% client-side, zero external MP3s, instant and offline-ready.
 */
class TodoHabitAudioEngine {
  private ctx: AudioContext | null = null;

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

  // Crisp ascending chime when checking off a task or habit
  public playCheckmarkSound() {
    if (typeof window === "undefined") return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.12); // B5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {}
  }

  // Resonant metallic willpower shield chime when resisting a bad habit urge
  public playShieldSound() {
    if (typeof window === "undefined") return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(440, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      // Shimmering overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch {}
  }

  // Triumphant chord when a habit milestone or template is adopted
  public playStreakSound() {
    if (typeof window === "undefined") return;
    try {
      const ctx = this.initContext();
      const now = ctx.currentTime;

      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });
    } catch {}
  }
}

export const todoHabitAudio = new TodoHabitAudioEngine();
