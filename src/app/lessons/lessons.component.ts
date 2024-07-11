import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  ViewChild,
} from '@angular/core';
import { LessonsService } from '../services/lessons.service';
import { Lesson } from '../models/lesson.model';
import { LessonDetailComponent } from './lesson-detail/lesson-detail.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'lessons',
  standalone: true,
  imports: [LessonDetailComponent],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss'],
})
export class LessonsComponent {
  mode = signal<'master' | 'detail'>('master');
  lessons = signal<Lesson[]>([]);
  selectedLesson = signal<Lesson | null>(null);
  lessonsService = inject(LessonsService);

  searchInput = viewChild.required<ElementRef>('search');

  onSearch() {
    const query = this.searchInput()?.nativeElement.value;
    console.log('search query', query);
    this.lessonsService
      .loadLessons({ query })
      .pipe(
        catchError(() => of([])) // Handle errors and return an observable emitting an empty array
      )
      .subscribe((results) => {
        this.lessons.set(results);
      });
  }

  onLessonSelected(lesson: Lesson) {
    this.mode.set('detail');
    this.selectedLesson.set(lesson);
  }

  onCancel() {
    this.mode.set('master');
  }

  onLessonUpdated(lesson: Lesson) {
    this.lessons.update((lessons) =>
      lessons.map((l) => (l.id === lesson.id ? lesson : l))
    );
  }
}
