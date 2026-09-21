import { signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TranslateService } from '@ngx-translate/core';

import { provideTestTranslations } from '../../../testing/translate-testing.provider';
import { AuthService, UserService, type GetUsersResponse } from '../../core';

import { UsersService } from './data-access';
import { MorePage } from './more.page';

describe('MorePage', () => {
  let component: MorePage;
  let fixture: ComponentFixture<MorePage>;

  const users = [
    {
      id: '1',
      googleId: 'google-id',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
    },
  ] satisfies GetUsersResponse;

  const usersValue = signal<GetUsersResponse | undefined>(undefined);
  const usersStatus = signal<'idle' | 'loading' | 'resolved' | 'error'>('loading');

  const usersServiceMock = {
    allUsersResource: {
      value: usersValue,
      status: usersStatus,
    },
  };

  const userServiceMock = {
    currentLanguage: signal<'de' | 'en'>('de'),
    setLanguage: vi.fn(),
  };

  const authServiceMock = {
    logout: vi.fn(),
  };

  const routerMock = {
    navigate: vi.fn().mockResolvedValue(true),
  };

  const loadingMock = {
    present: vi.fn().mockResolvedValue(undefined),
    dismiss: vi.fn().mockResolvedValue(undefined),
  };

  const loadingControllerMock = {
    create: vi.fn().mockResolvedValue(loadingMock),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    usersValue.set(undefined);
    usersStatus.set('loading');
    userServiceMock.currentLanguage.set('de');

    await TestBed.configureTestingModule({
      imports: [MorePage],
      providers: [
        provideTestTranslations(),
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: UserService,
          useValue: userServiceMock,
        },
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: Router,
          useValue: routerMock,
        },
        {
          provide: LoadingController,
          useValue: loadingControllerMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MorePage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the current language to the settings list', () => {
    const settingsList = fixture.nativeElement.querySelector('app-settings-list');

    expect(settingsList).toBeTruthy();

    const select = settingsList.querySelector('ion-select') as HTMLIonSelectElement;

    expect(select.value).toBe('de');
  });

  it('should update the language through the user service', () => {
    const select = fixture.nativeElement.querySelector('app-settings-list ion-select');

    select.dispatchEvent(
      new CustomEvent('ionChange', {
        detail: { value: 'en' },
      }),
    );

    expect(userServiceMock.setLanguage).toHaveBeenCalledOnce();
    expect(userServiceMock.setLanguage).toHaveBeenCalledWith('en');
  });

  it('should display the loading state while users are loading', () => {
    expect(fixture.nativeElement.textContent).toContain('general.loading');
  });

  it('should display resolved users', () => {
    usersValue.set(users);
    usersStatus.set('resolved');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Test User');
    expect(fixture.nativeElement.textContent).toContain('test@example.com');
  });

  it('should display the error state when loading users fails', () => {
    usersStatus.set('error');

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('general.error');
  });

  it('should logout and navigate to the overview page', async () => {
    const translate = TestBed.inject(TranslateService);
    vi.spyOn(translate, 'instant').mockReturnValue('Signing off');

    const logoutItem = fixture.nativeElement.querySelector(
      'app-settings-list ion-item[button]',
    ) as HTMLIonItemElement;

    logoutItem.click();

    await fixture.whenStable();

    expect(loadingControllerMock.create).toHaveBeenCalledWith({
      message: 'Signing off',
      spinner: 'circles',
    });

    expect(loadingMock.present).toHaveBeenCalledOnce();
    expect(authServiceMock.logout).toHaveBeenCalledOnce();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/tabs/overview']);
    expect(loadingMock.dismiss).toHaveBeenCalledOnce();
  });
});
