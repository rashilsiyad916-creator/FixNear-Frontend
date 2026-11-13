
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FancyOption } from '../../shared/fancy-select/fancy-select.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  role = 'Customer';
  message = '';
  loading = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  get roleOptions(): FancyOption[] {
    return [
      { value: 'Customer', label: 'Customer — I need services', icon: '🙋' },
      { value: 'Provider', label: 'Service Provider — I offer services', icon: '🛠️' }
    ];
  }

  get isProvider(): boolean {
    return this.role === 'Provider';
  }

  get formEyebrow(): string {
    return this.isProvider ? 'Grow with FixNear' : 'Join FixNear free';
  }

  get formHeadline(): string {
    return this.isProvider ? 'Start winning local jobs' : 'Create your account';
  }

  get formSubline(): string {
    return this.isProvider
      ? 'Set up your business, add your services and start receiving bookings.'
      : 'Save your favourite pros, book in seconds and track every job.';
  }

  get submitLabel(): string {
    if (this.loading) return 'Creating your account…';
    return this.isProvider ? 'Create provider account' : 'Create my free account';
  }

  register(): void {
    if (
      !this.fullName.trim() ||
      !this.email.trim() ||
      !this.password
    ) {
      this.message = 'Please complete all fields.';
      return;
    }

    if (this.password.length < 8) {
      this.message = 'Password must contain at least 8 characters.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.authService.register({
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role
    }).subscribe({
      next: (res) => {
        this.toast.success(
          res.role === 'Provider'
            ? 'Your provider account is ready — welcome to FixNear!'
            : 'Welcome to FixNear! Your account is ready.'
        );
        this.router.navigate([res.role === 'Provider' ? '/provider' : '/']);
      },
      error: (err) => {
        this.loading = false;
        this.message =
          err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
