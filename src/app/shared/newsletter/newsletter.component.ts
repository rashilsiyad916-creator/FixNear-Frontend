import { Component } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent {
  email = '';

  constructor(private toast: ToastService) {}

  subscribe(): void {
    if (!this.email || !this.email.includes('@')) {
      this.toast.error('Please enter a valid email address.');
      return;
    }
    this.toast.success('You\'re subscribed! Watch your inbox for updates.');
    this.email = '';
  }
}
