import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MessagesService } from '../messages/messages.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  fb = inject(FormBuilder);

  form = this.fb.group({
    email: [''],
    password: [''],
  });

  messagesService = inject(MessagesService);

  authService = inject(AuthService);

  router = inject(Router);

  onLogin() {
    const { email, password } = this.form.value;
    if (!email || !password) {
      this.messagesService.showMessage('Enter an email and password.', 'error');
      return;
    }

    this.authService
      .login(email, password)
      .pipe(
        switchMap(() => this.router.navigate(['/home'])),
        catchError((err) => {
          console.error(err);
          this.messagesService.showMessage(
            'Login failed, please try again',
            'error'
          );
          return of(null); // Handle error by returning a null observable
        })
      )
      .subscribe();
  }
}
