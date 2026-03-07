export interface ChimePlayer {
  play(): Promise<void>;
}

const defaultPlayer = (): ChimePlayer => ({
  async play() {
    if (typeof window === 'undefined') {
      return;
    }

    const context = new AudioContext();
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.06;

    osc.connect(gain);
    gain.connect(context.destination);

    osc.start();
    osc.stop(context.currentTime + 0.15);

    await new Promise<void>((resolve) => {
      osc.onended = () => resolve();
    });

    await context.close();
  },
});

export class AudioAlertService {
  constructor(private readonly player: ChimePlayer = defaultPlayer()) {}

  async playCompletionChime(): Promise<boolean> {
    try {
      await this.player.play();
      return true;
    } catch {
      return false;
    }
  }
}
