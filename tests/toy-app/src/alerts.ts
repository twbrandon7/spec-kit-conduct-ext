/**
 * Audio chime service using Web Audio API oscillator.
 * Gracefully handles environments where audio is unavailable.
 * Failures must never block timer transitions.
 */

/**
 * Play a short completion chime using a synthesized oscillator tone.
 * Best-effort: silently continues on any error.
 */
export async function playChime(): Promise<void> {
  try {
    const AudioContextClass =
      (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ??
      (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);       // A5
    oscillator.frequency.setValueAtTime(1320, ctx.currentTime + 0.1); // E6

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);

    await new Promise<void>((resolve) => {
      oscillator.onended = () => resolve();
      // Fallback timeout in case onended doesn't fire
      setTimeout(resolve, 800);
    });

    await ctx.close();
  } catch {
    // Best-effort: audio failure must not affect timer transitions
  }
}
