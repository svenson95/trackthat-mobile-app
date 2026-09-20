import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { LoginBoxComponent } from './login-box.component';
import { LoginFormComponent } from './login-form.component';

@Component({
  selector: 'app-login-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
class LoginFormStubComponent {}

describe('LoginBoxComponent', () => {
  let fixture: ComponentFixture<LoginBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginBoxComponent],
    })
      .overrideComponent(LoginBoxComponent, {
        remove: {
          imports: [LoginFormComponent],
        },
        add: {
          imports: [LoginFormStubComponent],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LoginBoxComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the login form', () => {
    expect(fixture.nativeElement.querySelector('app-login-form')).not.toBeNull();
  });
});
