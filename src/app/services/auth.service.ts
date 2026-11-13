import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from 'src/models/provider';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem('fixnear_user');
    return raw ? JSON.parse(raw) : null;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value?.token;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.storeUser(res))
    );
  }

  logout(): void {
    localStorage.removeItem('fixnear_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private storeUser(res: AuthResponse): void {
    localStorage.setItem('fixnear_user', JSON.stringify(res));
    this.currentUserSubject.next(res);
  }
}
