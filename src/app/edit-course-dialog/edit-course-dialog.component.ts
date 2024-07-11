import { Component, effect, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Course } from '../models/course.model';
import { EditCourseDialogData } from './edit-course-dialog.data.model';
import { CoursesService } from '../services/courses.service';
import { LoadingIndicatorComponent } from '../loading/loading.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CourseCategory } from '../models/course-category.model';
import { CourseCategoryComboboxComponent } from '../course-category-combobox/course-category-combobox.component';
import { Observable, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'edit-course-dialog',
  standalone: true,
  imports: [
    LoadingIndicatorComponent,
    ReactiveFormsModule,
    CourseCategoryComboboxComponent,
  ],
  templateUrl: './edit-course-dialog.component.html',
  styleUrls: ['./edit-course-dialog.component.scss'],
})
export class EditCourseDialogComponent {
  dialogRef = inject(MatDialogRef);

  data: EditCourseDialogData = inject(MAT_DIALOG_DATA);

  fb = inject(FormBuilder);

  form = this.fb.group({
    title: [''],
    longDescription: [''],
    iconUrl: ['']
  });

  courseService = inject(CoursesService);

  // signal emitted CourseCategory with initial value of BEGINNER
  category = signal<CourseCategory>('BEGINNER');

  constructor() {
    this.form.patchValue({
      title: this.data?.course?.title,
      longDescription: this.data?.course?.longDescription,
      iconUrl: this.data?.course?.iconUrl,
    });
    this.category.set(this.data?.course?.category ?? 'BEGINNER');
    effect(() => {
      console.log(`Course category bi-directional binding: ${this.category()}`);
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    const courseProps = this.form.value as Partial<Course>;
    courseProps.category = this.category();
    if (this.data?.mode === 'update') {
      this.saveCourse(this.data?.course!.id, courseProps);
    } else if (this.data?.mode === 'create') {
      this.createCourse(courseProps);
    }
  }

  createCourse(course: Partial<Course>) {
    this.courseService
      .createCourse(course)
      .pipe(
        catchError((err) => {
          console.error(err);
          alert(`Error creating the course.`);
          throw err;
        })
      )
      .subscribe((newCourse) => {
        this.dialogRef.close(newCourse);
      });
  }

  saveCourse(courseId: string, changes: Partial<Course>) {
    this.courseService
      .saveCourse(courseId, changes)
      .pipe(
        catchError((err) => {
          console.error(err);
          alert(`Failed to save the course.`);
          throw err;
        })
      )
      .subscribe((updatedCourse) => {
        this.dialogRef.close(updatedCourse);
      });
  }
}

export function openEditCourseDialog(
  dialog: MatDialog,
  data: EditCourseDialogData
): Observable<any> {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  config.data = data;

  const dialogRef = dialog.open(EditCourseDialogComponent, config);
  return dialogRef.afterClosed();
}

// export function openEditCourseDialog(
//   dialog: MatDialog,
//   data: EditCourseDialogData
// ): Promise<any> {
//   const config = new MatDialogConfig();
//   config.disableClose = true;
//   config.autoFocus = true;
//   config.width = '400px';
//   config.data = data;

//   const close$ = dialog.open(EditCourseDialogComponent, config).afterClosed();

//   return firstValueFrom(close$);
// }
