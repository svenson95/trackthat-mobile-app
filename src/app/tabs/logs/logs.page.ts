import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  IonCard,
  IonCardContent,
  IonContent,
  IonDatetime,
  IonHeader,
  IonItem,
  IonItemDivider,
  IonItemGroup,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { TranslateModule } from '@ngx-translate/core';

import { ContentContainerComponent, ExerciseItemComponent } from '../../shared/components';
import type { GetLogsWorkoutDTO, LogWorkoutDoc, WorkoutSet } from '../../shared/models';
import { UserService } from '../../shared/services';

import { LogsWorkoutService } from './services';

const ION_COMPONENTS = [
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonDatetime,
  IonItemGroup,
  IonItemDivider,
  IonList,
  IonItem,
  IonLabel,
];

@Component({
  selector: 'app-logs-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [...ION_COMPONENTS, TranslateModule, ContentContainerComponent, ExerciseItemComponent],
  styles: `
    ion-datetime {
      --background: var(--ion-card-background);
      --wheel-fade-background-rgb: 255, 255, 255;

      @media (prefers-color-scheme: dark) {
        --wheel-fade-background-rgb: 28, 28, 29;
      }
    }

    .logs-data-label {
      margin-inline: auto;
    }

    .date-card {
      margin: 16px;
      border-radius: var(--app-radius-1);

      ion-card-content {
        padding: 0.5rem;
      }
    }

    .exercises-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exercise-item {
      padding-inline: 1rem;
    }
  `,
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-title>Logs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" color="light">
      <ion-header collapse="condense">
        <ion-toolbar color="light">
          <ion-title size="large">Logs</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-content-container name="Logs page">
        <ion-card class="date-card">
          <ion-card-content>
            <ion-datetime
              presentation="date"
              [value]="selectedDateValue()"
              [highlightedDates]="highlightedDates()"
              [locale]="currentLanguage()"
              [firstDayOfWeek]="1"
              (ionChange)="onDateChange($event)"
            ></ion-datetime>
          </ion-card-content>
        </ion-card>

        @let selectedExercises = exercises();
        @if (selectedExercises.length > 0) {
          <div class="exercises-container">
            @for (exercise of selectedExercises; track exercise.name) {
              <ion-item-group class="exercise-item">
                <ion-item-divider class="exercise-item is-selected-exercise">
                  <app-exercise-item [exercise]="exercise.name" />
                </ion-item-divider>

                <ion-list class="item-container">
                  @for (
                    set of exercise.sets;
                    track set.itemId;
                    let idx = $index;
                    let isLast = $last
                  ) {
                    <ion-item
                      button
                      [detail]="false"
                      class="log-set ion-activatable"
                      [lines]="isLast ? 'none' : 'inset'"
                    >
                      <ion-label>
                        <h3>#{{ idx + 1 }}</h3>
                        <h3>{{ set.reps }}x {{ set.load }} kg</h3>
                        <h3>{{ set.time }}</h3>
                      </ion-label>
                    </ion-item>
                  }
                </ion-list>
              </ion-item-group>
            }
          </div>
        } @else if (isLoading()) {
          <p class="logs-data-label">{{ 'tabs.logs.loading' | translate }}</p>
        } @else {
          <p class="logs-data-label">{{ 'tabs.logs.no-data' | translate }}</p>
        }
      </app-content-container>
    </ion-content>
  `,
})
export class LogsPage {
  private readonly logWorkoutService = inject(LogsWorkoutService);
  private readonly userService = inject(UserService);

  private readonly logs = computed<GetLogsWorkoutDTO>(() => {
    return this.logWorkoutService.allLogsWorkoutResource.value() ?? [];
  });

  private readonly selectedDate = signal<number>(Math.floor(Date.now() / 1000));

  readonly selectedDateValue = computed(() => new Date(this.selectedDate() * 1000).toISOString());

  readonly isLoading = this.logWorkoutService.allLogsWorkoutResource.isLoading;
  readonly currentLanguage = this.userService.currentLanguage;

  readonly exercises = computed<{ name: string; sets: WorkoutSet[] }[]>(() => {
    const selectedDateInSeconds = this.timestampToDateIso(this.selectedDate());

    const sets = this.logs()
      .filter((log: LogWorkoutDoc) => this.timestampToDateIso(log.date) === selectedDateInSeconds)
      .reduce<WorkoutSet[]>((allSets, log) => [...allSets, ...(log.sets ?? [])], []);

    const exercises = this.groupSetsByExercise(sets);

    return exercises.sort((a, b) => this.getFirstExerciseTime(a) - this.getFirstExerciseTime(b));
  });

  readonly highlightedDates = computed(() => {
    return this.logs().map((l) => ({
      date: this.timestampToDateIso(l.date),
      backgroundColor: 'var(--ion-color-light-tint)',
    }));
  });

  onDateChange(event: CustomEvent): void {
    const value = event.detail.value;
    if (!value || Array.isArray(value)) return;

    const timestamp = Math.floor(new Date(value).getTime() / 1000);
    this.selectedDate.set(timestamp);
  }

  // TODO refactor copied functions to service
  private groupSetsByExercise(sets: WorkoutSet[]): { name: string; sets: WorkoutSet[] }[] {
    const grouped = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
      if (!acc[set.exercise]) {
        acc[set.exercise] = [];
      }

      acc[set.exercise].push(set);

      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, exerciseSets]) => ({
        name,
        sets: exerciseSets.sort((a, b) => this.timeToSeconds(a.time) - this.timeToSeconds(b.time)),
      }))
      .sort((a, b) => {
        const firstA = a.sets[0];
        const firstB = b.sets[0];

        return this.timeToSeconds(firstA?.time) - this.timeToSeconds(firstB?.time);
      });
  }

  private timeToSeconds(time: string | null | undefined): number {
    if (!time) return 0;
    const [hours = '0', minutes = '0', seconds = '0'] = time.split(':');
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
  }

  private getFirstExerciseTime(exercise: { name: string; sets: WorkoutSet[] }): number {
    const firstSet = exercise.sets[0];
    if (!firstSet) return 0;
    return this.timeToSeconds(firstSet.time);
  }

  private timestampToDateIso(timestampInSeconds: number): string {
    const date = new Date(timestampInSeconds * 1000);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
