import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Lesson } from '../models/lesson.model';
import { inject } from '@angular/core';
import { LessonsService } from '../services/lessons.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const courseLessonsResolver: ResolveFn<Lesson[]> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const courseId = route.paramMap.get('courseId');
  if (!courseId) {
    return of([]); // Return an observable emitting an empty array if no courseId
  }
  const lessonsService = inject(LessonsService);
  return lessonsService.loadLessons({ courseId }).pipe(
    catchError(() => of([])) // Handle errors and return an observable emitting an empty array
  );
};
