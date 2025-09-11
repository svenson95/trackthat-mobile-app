import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ContentContainerComponent } from '../../components';

import { MorePage } from './more.page';

describe('MorePage', () => {
  let component: MorePage;
  let fixture: ComponentFixture<MorePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, MorePage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(MorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
