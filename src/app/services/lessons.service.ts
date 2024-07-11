import { inject, Injectable } from '@angular/core';
import { Lesson } from '../models/lesson.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GetLessonsResponse } from '../models/get-lessons.response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LessonsService {
  env = environment;
  http = inject(HttpClient);

  loadLessons(config: {
    courseId?: string;
    query?: string;
  }): Observable<Lesson[]> {
    const { courseId, query } = config;
    let params = new HttpParams();
    if (courseId) {
      params = params.set('courseId', courseId);
    }
    if (query) {
      params = params.set('query', query);
    }
    return this.http
      .get<GetLessonsResponse>(`${this.env.apiRoot}/search-lessons`, { params })
      .pipe(map((response) => response.lessons));
  }

  saveLesson(lessonId: string, changes: Partial<Lesson>): Observable<Lesson> {
    return this.http.put<Lesson>(
      `${this.env.apiRoot}/lessons/${lessonId}`,
      changes
    );
  }
}
