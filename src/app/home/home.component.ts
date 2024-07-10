import {
  Component,
  computed,
  effect,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { CoursesService } from '../services/courses.service';
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { CoursesCardListComponent } from '../courses-card-list/courses-card-list.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';
import { catchError, from, throwError, of } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';

@Component({
  selector: 'home',
  standalone: true,
  imports: [MatTabGroup, MatTab, CoursesCardListComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  #courses = signal<Course[]>([]);
  beginnersList = viewChild<CoursesCardListComponent>('beginnersList');

  messageService = inject(MessagesService);
  coursesService = inject(CoursesService);
  dialog = inject(MatDialog);
  injector = inject(Injector);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter((course) => course.category === 'BEGINNER');
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter((course) => course.category === 'ADVANCED');
  });

  constructor() {
    // effect(() => {
    //   console.log(`beginnersList: `, this.beginnersList());
    // });

    // effect(() => {
    //   console.log(`Beginner courses: `, this.beginnerCourses());
    //   console.log(`Advanced courses: `, this.advancedCourses());
    // });

    this.loadCourses();
  }

  loadCourses() {
    this.coursesService
      .loadAllCourses()
      .pipe(
        catchError((err) => {
          this.messageService.showMessage(`Error loading courses!`, 'error');

          console.error(err);
          return of([]); // Return an empty array in case of error
        })
      )
      .subscribe((courses) => {
        this.#courses.set(courses.sort(sortCoursesBySeqNo));
      });
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();
    const newCourses = courses.map((course) =>
      course.id === updatedCourse.id ? updatedCourse : course
    );
    this.#courses.set(newCourses);
  }

  onCourseDeleted(courseId: string) {
    this.coursesService
      .deleteCourse(courseId)
      .pipe(
        catchError((err) => {
          console.error(err);
          alert(`Error deleting course.`);
          return throwError(err);
        })
      )
      .subscribe(() => {
        const courses = this.#courses();
        const newCourses = courses.filter((course) => course.id !== courseId);
        this.#courses.set(newCourses);
      });
  }

  onAddCourse() {
    from(
      openEditCourseDialog(this.dialog, {
        mode: 'create',
        title: 'Create New Course',
      })
    ).subscribe((newCourse) => {
      if (!newCourse) {
        return;
      }
      const newCourses = [...this.#courses(), newCourse];
      this.#courses.set(newCourses);
    });
  }

  onToObservableExample() {
    const numbers = signal(0);
    numbers.set(1);
    numbers.set(2);
    numbers.set(3);
    const numbers$ = toObservable(numbers, {
      injector: this.injector,
    });
    numbers.set(4);
    numbers$.subscribe((val) => {
      console.log(`numbers$: `, val);
    });
    numbers.set(5);
  }

  onToSignalExample() {
    try {
      const courses$ = this.coursesService.loadAllCourses().pipe(
        catchError((err) => {
          console.log(`Error caught in catchError`, err);
          throw err;
        })
      );
      const courses = toSignal(courses$, {
        injector: this.injector,
        rejectErrors: true,
      });
      effect(
        () => {
          console.log(`Courses: `, courses());
        },
        {
          injector: this.injector,
        }
      );

      setInterval(() => {
        console.log(`Reading courses signal: `, courses());
      }, 1000);
    } catch (err) {
      console.log(`Error in catch block: `, err);
    }
  }
}
