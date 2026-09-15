import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StartupService {
  private readonly APP_INITIALIZER_FADE_DURATION_MS = 300;
  private readonly APP_INITIALIZER_MIN_VISIBLE_MS = 600;
  private readonly startedAt = performance.now();

  routeActivated = false;

  hideAppInitializer(): void {
    const elapsed = performance.now() - this.startedAt;
    const remaining = Math.max(0, this.APP_INITIALIZER_MIN_VISIBLE_MS - elapsed);

    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.removeAppInitializerElement();
        });
      });
    }, remaining);
  }

  removeAppInitializerElement(): void {
    const loader = document.getElementById('app-initializer');

    if (!loader) {
      return;
    }

    loader.classList.add('app-initializer--hidden');

    window.setTimeout(() => {
      loader.remove();
    }, this.APP_INITIALIZER_FADE_DURATION_MS);
  }
}
