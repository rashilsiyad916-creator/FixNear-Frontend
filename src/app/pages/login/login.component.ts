
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

type LoginRole = 'Customer' | 'Provider';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  loading = false;
  showPassword = false;
  role: LoginRole = 'Customer';

  readonly roles: { value: LoginRole; label: string; hint: string; icon: string }[] = [
    { value: 'Customer', label: 'I need a pro', hint: 'Book & track services', icon: '🙋' },
    { value: 'Provider', label: 'I am a pro', hint: 'Manage my business', icon: '🛠️' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  get isProvider(): boolean {
    return this.role === 'Provider';
  }

  get roleEyebrow(): string {
    return this.isProvider ? 'Provider sign in' : 'Customer sign in';
  }

  get roleHeadline(): string {
    return this.isProvider ? 'Welcome back to your studio' : 'Good to see you again';
  }

  get roleSubline(): string {
    return this.isProvider
      ? 'Sign in to manage bookings, services and your public storefront.'
      : 'Sign in to book trusted pros and keep every job in one place.';
  }

  get emailLabel(): string {
    return this.isProvider ? 'Business email' : 'Email address';
  }

  get submitLabel(): string {
    if (this.loading) return 'Signing you in…';
    return this.isProvider ? 'Open Provider Studio' : 'Sign in to FixNear';
  }

  selectRole(role: LoginRole): void {
    if (this.role === role) return;
    this.role = role;
    this.message = '';
    this.email = '';
    this.password = '';
  }

  login(): void {
    if (!this.email.trim() || !this.password) {
      this.message = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.login({ email: this.email.trim(), password: this.password })
      .subscribe({
        next: (res) => {
          const firstName = res.fullName.split(' ')[0];
          const isProviderAccount = res.role === 'Provider';

          if (res.role === 'Admin') {
            this.toast.success(`Welcome back, ${firstName}! Opening the approval queue.`);
            this.router.navigate(['/admin']);
          } else if (isProviderAccount) {
            this.toast.success(`Welcome back, ${firstName}! Opening your Provider Studio.`);
            this.router.navigate(['/provider']);
          } else {
            this.toast.success(`Welcome back, ${firstName}! Let's get something fixed.`);
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.message =
            err?.error?.message ||
            'That email and password did not match. Please check and try again.';
        }
      });
  }
}
