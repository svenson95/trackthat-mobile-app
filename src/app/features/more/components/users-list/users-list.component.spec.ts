import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideTestTranslations } from '../../../../../testing/translate-testing.provider';
import type { GetUsersResponse } from '../../../../core';

import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
  let fixture: ComponentFixture<UsersListComponent>;

  const users = [
    {
      id: '1',
      googleId: 'google-id-1',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
      email: 'test@example.com',
    },
    {
      id: '2',
      googleId: 'google-id-2',
      name: 'Second User',
      picture: 'https://example.com/avatar-2.jpg',
      email: 'second@example.com',
    },
  ] satisfies GetUsersResponse;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [provideTestTranslations()],
    }).compileComponents();
  });

  function createComponent({
    users: inputUsers = [],
    isLoading = false,
    isResolved = false,
    hasError = false,
  }: {
    users?: GetUsersResponse;
    isLoading?: boolean;
    isResolved?: boolean;
    hasError?: boolean;
  } = {}): void {
    fixture = TestBed.createComponent(UsersListComponent);

    fixture.componentRef.setInput('users', inputUsers);
    fixture.componentRef.setInput('isLoading', isLoading);
    fixture.componentRef.setInput('isResolved', isResolved);
    fixture.componentRef.setInput('hasError', hasError);

    fixture.detectChanges();
  }

  it('should display resolved users', () => {
    createComponent({
      users,
      isResolved: true,
    });

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Test User');
    expect(text).toContain('test@example.com');
    expect(text).toContain('Second User');
    expect(text).toContain('second@example.com');
  });

  it('should display the loading state', () => {
    createComponent({
      isLoading: true,
    });

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('general.loading');
  });

  it('should display the error state', () => {
    createComponent({
      hasError: true,
    });

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('general.error');
  });

  it('should display no users when the resolved result is empty', () => {
    createComponent({
      users: [],
      isResolved: true,
    });

    const userItems = fixture.nativeElement.querySelectorAll('ion-item-group > ion-item');

    expect(userItems).toHaveLength(0);
  });
});
