/**
 * Web Audio API synthesizer and Custom Audio Manager for Commit7.
 * Provides custom & embedded sounds with precise durations:
 * - Notification sound: 1 to max 5 seconds (no repeat, cuts at 5 seconds)
 * - Alarm sound: 30 seconds (repeats/loops if shorter up to 30 seconds, stops on OK or after 30s)
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private currentAlarmAudio: HTMLAudioElement | null = null;
  private currentNotificationAudio: HTMLAudioElement | null = null;
  private alarmTimeoutId: number | null = null;
  private notificationTimeoutId: number | null = null;
  private alarmLoopIntervalId: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Stop any active alarm sound immediately (used when user taps OK or after 30s)
   */
  public stopAlarm(): void {
    if (this.alarmTimeoutId !== null) {
      clearTimeout(this.alarmTimeoutId);
      this.alarmTimeoutId = null;
    }
    if (this.alarmLoopIntervalId !== null) {
      clearInterval(this.alarmLoopIntervalId);
      this.alarmLoopIntervalId = null;
    }
    if (this.currentAlarmAudio) {
      try {
        this.currentAlarmAudio.pause();
        this.currentAlarmAudio.currentTime = 0;
      } catch (e) {
        console.error('Error stopping custom alarm audio:', e);
      }
      this.currentAlarmAudio = null;
    }
  }

  /**
   * Stop any active notification sound preview
   */
  public stopNotification(): void {
    if (this.notificationTimeoutId !== null) {
      clearTimeout(this.notificationTimeoutId);
      this.notificationTimeoutId = null;
    }
    if (this.currentNotificationAudio) {
      try {
        this.currentNotificationAudio.pause();
        this.currentNotificationAudio.currentTime = 0;
      } catch (e) {
        console.error('Error stopping custom notification audio:', e);
      }
      this.currentNotificationAudio = null;
    }
  }

  /**
   * Section 7.4 Alarm Sound:
   * Plays default or custom alarm sound for 30 seconds.
   * If sound is shorter than 30s, it repeats / loops up to 30 seconds.
   * Rings until tapped OK or 30s finishes.
   */
  public playAlarmSound(customUrl?: string, onAutoEnd?: () => void): void {
    // Stop any existing alarm first
    this.stopAlarm();

    if (customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.loop = true;
        this.currentAlarmAudio = audio;
        audio.play().catch((err) => {
          console.warn('Custom audio playback blocked, falling back to synth chime:', err);
          this.playDefaultAlarmLoop();
        });
      } catch (e) {
        this.playDefaultAlarmLoop();
      }
    } else {
      this.playDefaultAlarmLoop();
    }

    // Alarm plays for max 30 seconds then automatically turns off
    this.alarmTimeoutId = window.setTimeout(() => {
      this.stopAlarm();
      if (onAutoEnd) onAutoEnd();
    }, 30000);
  }

  /**
   * Loops default synth alarm chime for up to 30s
   */
  private playDefaultAlarmLoop(): void {
    this.playAlarmChime();
    this.alarmLoopIntervalId = window.setInterval(() => {
      this.playAlarmChime();
    }, 1600);
  }

  /**
   * Section 7.4 Alarm Synth Chime
   */
  public playAlarmChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6 arpeggio

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.5);
    });
  }

  /**
   * Notification Sound:
   * Plays for 1 to max 5 seconds (no repeat, cuts at 5s).
   */
  public playNotificationSound(customUrl?: string, onEnd?: () => void): void {
    this.stopNotification();

    if (customUrl) {
      try {
        const audio = new Audio(customUrl);
        audio.loop = false;
        this.currentNotificationAudio = audio;

        audio.play().catch((err) => {
          console.warn('Custom notification playback failed, fallback to synth ping:', err);
          this.playNotificationPing();
        });

        // Cut at 5 seconds max (no repeat)
        this.notificationTimeoutId = window.setTimeout(() => {
          this.stopNotification();
          if (onEnd) onEnd();
        }, 5000);

        audio.onended = () => {
          this.stopNotification();
          if (onEnd) onEnd();
        };
      } catch (e) {
        this.playNotificationPing();
        if (onEnd) setTimeout(onEnd, 500);
      }
    } else {
      this.playNotificationPing();
      if (onEnd) setTimeout(onEnd, 500);
    }
  }

  /**
   * Subtle notification ping (synthesizer)
   */
  public playNotificationPing(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(830.61, now); // G#5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Success celebration sound for completed goals / streaks
   */
  public playSuccessFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio chord

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  /**
   * Gentle pop for toggle / interaction
   */
  public playPop(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundManager = new SoundSynthesizer();
