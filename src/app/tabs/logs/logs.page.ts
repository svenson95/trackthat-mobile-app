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
import type { GetLogsWorkoutDTO, WorkoutSet } from '../../shared/models';
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
      --background: white;
      --background-rgb: rgb(255, 255, 255);
    }

    .no-data {
      margin-inline: auto;
    }

    .date-card {
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
              [value]="selectedDateIso()"
              (ionChange)="onDateChange($event)"
            ></ion-datetime>
          </ion-card-content>
        </ion-card>

        @let data = logs();
        @if (data.length > 0) {
          <div class="exercises-container">
            @for (exercise of exercises(); track exercise.name) {
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
        } @else {
          <p class="no-data">Keine Logs für diesen Tag vorhanden.</p>
        }
      </app-content-container>
    </ion-content>
  `,
})
export class LogsPage {
  private readonly logWorkoutService = inject(LogsWorkoutService);
  private readonly userService = inject(UserService);

  readonly selectedDateIso = signal(new Date().toISOString());
  readonly logs = signal<GetLogsWorkoutDTO>([]);

  readonly selectedDate = computed(() => new Date(this.selectedDateIso()));

  readonly exercises = computed<{ name: string; sets: WorkoutSet[] }[]>(() => {
    // TODO: show all logs not only first one
    const sets = this.logs()[0].sets ?? [];
    const exercises = this.groupSetsByExercise(sets);

    return exercises.sort((a, b) => this.getFirstExerciseTime(a) - this.getFirstExerciseTime(b));
  });

  // TODO refactor copied functions to service
  private groupSetsByExercise(sets: WorkoutSet[]): { name: string; sets: WorkoutSet[] }[] {
    const grouped = sets.reduce<Record<string, WorkoutSet[]>>((acc, set) => {
      const exercise = set.exercise;

      if (!acc[exercise]) acc[exercise] = [];
      acc[exercise].push(set);

      return acc;
    }, {});

    return Object.keys(grouped)
      .map((name) => {
        const exerciseSets = grouped[name].sort((a, b) => {
          return this.timeToSeconds(a.time) - this.timeToSeconds(b.time);
        });

        return {
          name,
          sets: exerciseSets,
        };
      })
      .sort((a, b) => {
        const newestASet = a.sets[a.sets.length - 1];
        const newestBSet = b.sets[b.sets.length - 1];

        const newestA = this.timeToSeconds(newestASet?.time);
        const newestB = this.timeToSeconds(newestBSet?.time);

        return newestB - newestA;
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

  constructor() {
    this.loadLogsForSelectedDate();
  }

  onDateChange(event: CustomEvent): void {
    const value = event.detail.value;

    if (!value || Array.isArray(value)) return;

    this.selectedDateIso.set(value);
    this.loadLogsForSelectedDate();
  }

  private loadLogsForSelectedDate(): void {
    const userId = this.userService.userData()?.id;

    if (!userId) {
      this.logs.set([]);
      return;
    }

    const selectedDate = new Date(this.selectedDateIso());

    const dateInSeconds = Math.floor(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      ).getTime() / 1000,
    );

    this.logWorkoutService.getAllLogsWorkout(dateInSeconds, userId).subscribe({
      next: (logs) => this.logs.set(logs ?? []),
      error: () => this.logs.set([]),
    });
  }
}
