import { Injectable } from '@angular/core';

const FADE_DURATION_MS = 300;
const MIN_VISIBLE_DURATION_MS = 600;

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  private startedAt = 0;

  init(): void {
    this.startedAt = performance.now();
  }

  hideOverlay(): void {
    const elapsed = performance.now() - this.startedAt;
    const remaining = Math.max(0, MIN_VISIBLE_DURATION_MS - elapsed);

    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.removeOverlay();
        });
      });
    }, remaining);
  }

  private removeOverlay(): void {
    const initializer = document.getElementById('app-init-overlay');

    if (!initializer) {
      return;
    }

    initializer.classList.add('app-init-overlay--hidden');

    window.setTimeout(() => {
      initializer.remove();
    }, FADE_DURATION_MS);
  }
}
