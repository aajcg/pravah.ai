let audioContext: AudioContext | null = null;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!audioContext) {
    audioContext = new window.AudioContext();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

export function playUiClick(enabled: boolean): void {
  if (!enabled) {
    return;
  }

  const ctx = ensureContext();
  if (!ctx) {
    return;
  }

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.exponentialRampToValueAtTime(640, now + 0.05);

  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.1);
}
