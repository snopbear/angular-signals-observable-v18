import {Injectable, inject} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable, firstValueFrom, map} from "rxjs";
import {Course} from "../models/course.model";
import {GetCoursesResponse} from "../models/get-courses.response";


@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  http = inject(HttpClient);

  env = environment;

  loadAllCourses(): Observable<Course[]> {
    debugger
    return this.http
      .get<GetCoursesResponse>(`${this.env.apiRoot}/courses`)
      .pipe(map((response) => response.courses));
  }

  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.env.apiRoot}/courses/${courseId}`);
  }

  createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.env.apiRoot}/courses`, course);
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<Course> {
    debugger
    return this.http.put<Course>(
      `${this.env.apiRoot}/courses/${courseId}`,
      changes
    );
  }

  deleteCourse(courseId: string): Observable<void> {
    return this.http.delete<void>(`${this.env.apiRoot}/courses/${courseId}`);
  }
}