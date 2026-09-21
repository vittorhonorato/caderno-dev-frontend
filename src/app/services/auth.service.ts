import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginPayload, LoginResponse, RegisterPayload } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'caderno-dev-token';
  private readonly userKey = 'caderno-dev-user';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', payload).pipe(
      tap(response => this.persistSession(response.token, payload.username))
    );
  }

  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<void>('/auth/register', payload);
  }

  logout(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  getToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(this.tokenKey);
  }

  getUsername(): string {
    return typeof localStorage === 'undefined' ? '' : localStorage.getItem(this.userKey) ?? '';
  }

  private persistSession(token: string, username: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, username);
  }
}
