import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AppInitializerService {
  private readonly FADE_DURATION_MS = 300;
  private readonly MIN_VISIBLE_DURATION_MS = 600;
  private readonly startedAt = performance.now();

  routeActivated = false;

  hideOverlay(): void {
    const elapsed = performance.now() - this.startedAt;
    const remaining = Math.max(0, this.MIN_VISIBLE_DURATION_MS - elapsed);

    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.removeOverlay();
        });
      });
    }, remaining);
  }

  private removeOverlay(): void {
    const initializer = document.getElementById('app-initializer');

    if (!initializer) {
      return;
    }

    initializer.classList.add('app-initializer--hidden');

    window.setTimeout(() => {
      initializer.remove();
    }, this.FADE_DURATION_MS);
  }
}
