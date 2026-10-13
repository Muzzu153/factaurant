// src/core/utils/audio.ts

// 🔔 NATIVE WEB AUDIO CHIME (Zero external .mp3 files required!)
export function playKitchenChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Create a smooth two-tone service bell (D5 -> A5 chime)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5 pitch
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // Glides to A5 pitch

    // Volume envelope (gentle attack, smooth decay)
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  } catch (err) {
    // Graceful fallback if user hasn't interacted with page yet (browser autoplay policy)
    console.warn('Audio chime postponed pending user interaction:', err);
  }
}