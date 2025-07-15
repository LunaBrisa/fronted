// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token: { type: string; value: string };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:52792/api';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {}

  register(userData: { fullName: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, userData)
      .pipe(tap((response) => this.setToken(response.token.value)));
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response) => this.setToken(response.token.value)));
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.clearToken()));
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
