import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

const USER_STORAGE_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #userSignal = signal<User | null>(null);

  user = this.#userSignal.asReadonly();

  isLoggedIn = computed(() => !!this.user());

  http = inject(HttpClient);

  router = inject(Router);

  constructor() {
    this.loadUserFromStorage();
    effect(() => {
      const user = this.user();
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
    });
  }

  loadUserFromStorage() {
    const json = localStorage.getItem(USER_STORAGE_KEY);
    if (json) {
      const user = JSON.parse(json);
      this.#userSignal.set(user);
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${environment.apiRoot}/login`, { email, password })
      .pipe(tap((user) => this.#userSignal.set(user)));
  }

  // logout(): Observable<boolean> {
  logout(){
    // return new Observable((observer) => {
      localStorage.removeItem(USER_STORAGE_KEY);
      this.#userSignal.set(null);
      this.router.navigateByUrl('/login');
      // this.router.navigateByUrl('/login').then(
      //   (success) => {
      //     observer.next(success);
      //     observer.complete();
      //   },
      //   (error) => {
      //     observer.error(error);
      //   }
      // );
    // });
  }
}
