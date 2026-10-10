// Web Audio API tone generator for mechanical and synthetic typing sounds

class SoundService {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeySound(profile: string = 'mechanical', volume: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.connect(this.ctx.destination);

      const baseVolume = Math.max(0, Math.min(1, volume)) * 0.15;

      if (profile === 'typewriter') {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        gainNode.gain.setValueAtTime(baseVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (profile === 'soft') {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400 + Math.random() * 50, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.03);

        gainNode.gain.setValueAtTime(baseVolume * 0.8, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.04);
      } else {
        // mechanical / click default
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.025);

        gainNode.gain.setValueAtTime(baseVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gainNode);
        osc.start(now);
        osc.stop(now + 0.035);
      }
    } catch {
      // Audio play blocked or unsupported safely caught
    }
  }

  playErrorSound(volume: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.1);

      gainNode.gain.setValueAtTime(volume * 0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio safety guard
    }
  }

  playSuccessSound(volume: number = 0.5) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const noteTime = now + i * 0.08;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gainNode.gain.setValueAtTime(volume * 0.15, noteTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.16);
      });
    } catch {
      // Audio safety guard
    }
  }
}

export const soundService = new SoundService();
