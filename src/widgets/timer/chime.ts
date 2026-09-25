// A short two-note chime synthesized with Web Audio, so there's no asset to load.
export function playChime(): void {
  const AudioContextClass = window.AudioContext as typeof AudioContext | undefined;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const start = context.currentTime;
  for (const [offset, frequency] of [
    [0, 880],
    [0.22, 1318.5],
  ] as const) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start + offset);
    gain.gain.exponentialRampToValueAtTime(0.25, start + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.6);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + offset);
    oscillator.stop(start + offset + 0.65);
  }
  setTimeout(() => void context.close(), 1200);
}
