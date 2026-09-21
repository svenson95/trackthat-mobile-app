import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideTestTranslations } from '../../../../../testing/translate-testing.provider';
import { DEFAULT_LANGUAGE, type SupportedLanguage } from '../../../../core';

import { SettingsListComponent } from './settings-list.component';

@Component({
  imports: [SettingsListComponent],
  template: `
    <app-settings-list
      [currentLanguage]="currentLanguage()"
      (logout)="onLogout()"
      (languageChange)="onLanguageChange($event)"
    />
  `,
})
class TestHostComponent {
  readonly currentLanguage = signal<SupportedLanguage>('de');

  readonly onLogout = vi.fn();
  readonly onLanguageChange = vi.fn();
}

describe('SettingsListComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideTestTranslations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should display the current language', () => {
    const select = fixture.nativeElement.querySelector('ion-select') as HTMLIonSelectElement;

    expect(select.value).toBe(DEFAULT_LANGUAGE);
  });

  it('should emit logout when the logout item is clicked', () => {
    const logoutItem = fixture.nativeElement.querySelector(
      'ion-item[button]',
    ) as HTMLIonItemElement;

    logoutItem.click();

    expect(host.onLogout).toHaveBeenCalledOnce();
  });

  it('should emit the selected language', () => {
    const select = fixture.nativeElement.querySelector('ion-select');

    select.dispatchEvent(
      new CustomEvent('ionChange', {
        detail: { value: 'en' },
      }),
    );

    expect(host.onLanguageChange).toHaveBeenCalledOnce();
    expect(host.onLanguageChange).toHaveBeenCalledWith('en');
  });

  it('should update the selected language', () => {
    host.currentLanguage.set('en');

    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('ion-select') as HTMLIonSelectElement;

    expect(select.value).toBe('en');
  });
});
