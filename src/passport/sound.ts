let audio: AudioContext | undefined;

/** Call from the click that turns sound on, so the browser lets the context run. */
export function prepareSound(): void {
  try {
    audio ??= new AudioContext();
    if (audio.state === 'suspended') void audio.resume();
  } catch {
    // No Web Audio here: the stamp still lands, silently.
  }
}

/** A short low thump, made from one oscillator. No audio files. */
export function playStamp(): void {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    // See above.
  }
}
