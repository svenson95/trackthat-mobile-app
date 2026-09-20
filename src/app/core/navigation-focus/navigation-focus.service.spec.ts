import { TestBed } from '@angular/core/testing';
import { NavigationEnd, NavigationStart, Router, type Event } from '@angular/router';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NavigationFocusService } from './navigation-focus.service';

describe('NavigationFocusService', () => {
  let service: NavigationFocusService;
  let routerEvents$: Subject<Event>;

  const createFocusableElement = (): HTMLButtonElement => {
    const element = document.createElement('button');

    document.body.appendChild(element);
    element.focus();

    return element;
  };

  beforeEach(() => {
    routerEvents$ = new Subject<Event>();

    TestBed.configureTestingModule({
      providers: [
        NavigationFocusService,
        {
          provide: Router,
          useValue: {
            events: routerEvents$,
          },
        },
      ],
    });

    service = TestBed.inject(NavigationFocusService);
  });

  afterEach(() => {
    routerEvents$.complete();

    document.body.querySelectorAll('button').forEach((element) => element.remove());

    vi.restoreAllMocks();

    TestBed.resetTestingModule();
  });

  describe('init', () => {
    it('should blur the active element when navigation starts', () => {
      const element = createFocusableElement();
      const blurSpy = vi.spyOn(element, 'blur');

      service.init();

      routerEvents$.next(new NavigationStart(1, '/tabs/training'));

      expect(blurSpy).toHaveBeenCalledOnce();
    });

    it('should not blur the active element for other router events', () => {
      const element = createFocusableElement();
      const blurSpy = vi.spyOn(element, 'blur');

      service.init();

      routerEvents$.next(new NavigationEnd(1, '/tabs/training', '/tabs/training'));

      expect(blurSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when the active element is not an HTMLElement', () => {
      const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

      vi.spyOn(document, 'activeElement', 'get').mockReturnValue(svgElement);

      service.init();

      expect(() => {
        routerEvents$.next(new NavigationStart(1, '/tabs/training'));
      }).not.toThrow();
    });
  });
});
