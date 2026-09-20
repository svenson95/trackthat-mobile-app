import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../testing/translate-testing.provider';
import type { UserDoc } from '../../core';
import { AuthService, UserService } from '../../core';

import { HelloBoxComponent, LoginBoxComponent } from './components';
import { OverviewPage } from './overview.page';

@Component({
  selector: 'app-hello-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class HelloBoxStubComponent {
  readonly user = input.required<UserDoc>();
}

@Component({
  selector: 'app-login-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class LoginBoxStubComponent {}

describe('OverviewPage', () => {
  let component: OverviewPage;
  let fixture: ComponentFixture<OverviewPage>;

  const isLoggedIn = signal(false);
  const userData = signal<UserDoc | null>(null);

  beforeEach(async () => {
    isLoggedIn.set(false);
    userData.set(null);

    await TestBed.configureTestingModule({
      imports: [OverviewPage],
      providers: [
        provideTestTranslations(),
        {
          provide: AuthService,
          useValue: {
            isLoggedIn,
          },
        },
        {
          provide: UserService,
          useValue: {
            userData,
          },
        },
      ],
    })
      .overrideComponent(OverviewPage, {
        remove: {
          imports: [HelloBoxComponent, LoginBoxComponent],
        },
        add: {
          imports: [HelloBoxStubComponent, LoginBoxStubComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OverviewPage);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the login box when the user is not logged in', () => {
    const loginBox = fixture.nativeElement.querySelector('app-login-box');
    const helloBox = fixture.nativeElement.querySelector('app-hello-box');

    expect(loginBox).not.toBeNull();
    expect(helloBox).toBeNull();
  });

  it('should show the dashboard when the user is logged in', () => {
    const user = {
      name: 'Sven',
    } as UserDoc;

    userData.set(user);
    isLoggedIn.set(true);

    fixture.detectChanges();

    const loginBox = fixture.nativeElement.querySelector('app-login-box');
    const helloBox = fixture.nativeElement.querySelector('app-hello-box');

    expect(loginBox).toBeNull();
    expect(helloBox).not.toBeNull();
  });

  it('should not show the dashboard when no user data is available', () => {
    isLoggedIn.set(true);
    userData.set(null);

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-hello-box')).toBeNull();

    expect(fixture.nativeElement.querySelector('app-login-box')).not.toBeNull();
  });

  it('should pass the current user to the dashboard', () => {
    const user = {
      name: 'Sven',
    } as UserDoc;

    userData.set(user);
    isLoggedIn.set(true);

    fixture.detectChanges();

    const helloBox = fixture.debugElement.query(
      (debugElement) => debugElement.componentInstance instanceof HelloBoxStubComponent,
    );

    expect(helloBox.componentInstance.user()).toBe(user);
  });
});
