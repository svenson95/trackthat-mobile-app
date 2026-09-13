import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ContentContainerComponent } from './content-container.component';

describe('ContentContainerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContentContainerComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
