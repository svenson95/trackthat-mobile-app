import { provideHttpClient } from '@angular/common/http';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { addIcons } from 'ionicons';
import { logoGoogle } from 'ionicons/icons';

import { ContentContainerComponent } from '../../components';
import '../../test-mocks/google.mock';

import { OverviewPage } from './overview.page';

describe('OverviewPage', () => {
  let component: OverviewPage;
  let fixture: ComponentFixture<OverviewPage>;

  beforeEach(async () => {
    addIcons({
      'logo-google': logoGoogle,
    });

    await TestBed.configureTestingModule({
      imports: [ContentContainerComponent, OverviewPage],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
