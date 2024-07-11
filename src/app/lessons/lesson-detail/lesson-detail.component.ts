import { Component, inject, Input, Output, EventEmitter, input, output } from '@angular/core';
import { Lesson } from '../../models/lesson.model';
import { ReactiveFormsModule } from '@angular/forms';
import { LessonsService } from '../../services/lessons.service';
import { MessagesService } from '../../messages/messages.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'lesson-detail',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lesson-detail.component.html',
  styleUrls: ['./lesson-detail.component.scss'],
})
export class LessonDetailComponent {
  lesson = input.required<Lesson | null>();
  lessonUpdated = output<Lesson>();
  cancel = output();

  lessonsService = inject(LessonsService);
  messagesService = inject(MessagesService);

  onCancel() {
    this.cancel.emit();
  }

  onSave(description: string) {
      const lesson = this.lesson();
    if (lesson) {
      this.lessonsService
        .saveLesson(lesson.id, { description })
        .pipe(
          catchError((err) => {
            console.error(err);
            this.messagesService.showMessage(`Error saving lesson!`, 'error');
            return of(null);
          })
        )
        .subscribe((updatedLesson) => {
          if (updatedLesson) {
            this.lessonUpdated.emit(updatedLesson);
          }
        });
    }
  }
}
