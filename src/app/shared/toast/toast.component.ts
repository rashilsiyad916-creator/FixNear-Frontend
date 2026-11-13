import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Toast, ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  icon(type: Toast['type']): string {
    if (type === 'success') return '✓';
    if (type === 'error') return '✕';
    return 'ℹ';
  }
}
