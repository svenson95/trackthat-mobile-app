import { Injectable, signal } from '@angular/core';

export type ServerStartupStatus = 'hidden' | 'starting' | 'started' | 'failed';

type TrackedRequest = {
  isSlow: boolean;
};

const SUCCESS_DISPLAY_DURATION = 1_500;
const FAILURE_DISPLAY_DURATION = 2_500;

@Injectable({
  providedIn: 'root',
})
export class ServerStartupService {
  readonly status = signal<ServerStartupStatus>('hidden');

  private readonly requests = new Map<string, TrackedRequest>();

  private hasConnectionFailure = false;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  registerRequest(requestId: string): void {
    this.requests.set(requestId, {
      isSlow: false,
    });
  }

  markAsSlow(requestId: string): void {
    const request = this.requests.get(requestId);

    if (!request) {
      return;
    }

    request.isSlow = true;

    this.clearHideTimeout();

    if (this.status() !== 'starting') {
      this.hasConnectionFailure = false;
      this.status.set('starting');
    }
  }

  markAsSuccessful(requestId: string): void {
    const request = this.requests.get(requestId);

    if (!request) {
      return;
    }

    this.requests.delete(requestId);

    if (request.isSlow || this.status() === 'starting') {
      this.showStarted();
    }
  }

  markAsFailed(requestId: string, connectionFailure: boolean): void {
    const request = this.requests.get(requestId);

    if (!request) {
      return;
    }

    this.requests.delete(requestId);

    if (this.status() !== 'starting') {
      return;
    }

    if (!connectionFailure) {
      // Eine HTTP-Antwort wurde empfangen.
      // Der Server ist also grundsätzlich erreichbar.
      this.showStarted();
      return;
    }

    this.hasConnectionFailure = true;
    this.finishIfNoRequestsRemain();
  }

  unregisterRequest(requestId: string): void {
    if (!this.requests.delete(requestId)) {
      return;
    }

    this.finishIfNoRequestsRemain();
  }

  private showStarted(): void {
    this.requests.clear();
    this.hasConnectionFailure = false;

    this.status.set('started');

    this.scheduleHide(SUCCESS_DISPLAY_DURATION);
  }

  private showFailed(): void {
    this.hasConnectionFailure = false;

    this.status.set('failed');

    this.scheduleHide(FAILURE_DISPLAY_DURATION);
  }

  private finishIfNoRequestsRemain(): void {
    if (this.status() !== 'starting' || this.requests.size > 0) {
      return;
    }

    if (this.hasConnectionFailure) {
      this.showFailed();
      return;
    }

    this.status.set('hidden');
  }

  private scheduleHide(delay: number): void {
    this.clearHideTimeout();

    this.hideTimeout = setTimeout(() => {
      this.status.set('hidden');
    }, delay);
  }

  private clearHideTimeout(): void {
    if (!this.hideTimeout) {
      return;
    }

    clearTimeout(this.hideTimeout);
    this.hideTimeout = undefined;
  }
}
