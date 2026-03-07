import { TimerService } from './timer-service';

export class ControlService {
  constructor(private readonly timerService: TimerService) {}

  start(): void {
    if (this.timerService.getState().isRunning) {
      return;
    }

    this.timerService.start();
  }

  pause(): void {
    this.timerService.pause();
  }

  reset(): void {
    this.timerService.reset();
  }
}
