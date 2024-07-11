import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { Course } from '../models/course.model';
import { CoursesService } from '../services/courses.service';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const courseResolver: ResolveFn<Course | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const courseId = route.paramMap.get('courseId');
  if (!courseId) {
    return of(null); // Return an observable emitting null if no courseId
  }
  const coursesService = inject(CoursesService);
  return coursesService.getCourseById(courseId).pipe(
    catchError(() => of(null)) // Handle errors and return an observable emitting null
  );
};
