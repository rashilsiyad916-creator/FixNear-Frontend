import { Component, OnInit } from '@angular/core';
import { CategoryRequest, CategoryRequestStatus } from 'src/models/provider';
import { CategoryAdminService } from '../../services/category-admin.service';
import { ToastService } from '../../services/toast.service';

type RequestFilter = CategoryRequestStatus | 'All';

@Component({
  selector: 'app-admin-approvals',
  templateUrl: './admin-approvals.component.html',
  styleUrls: ['./admin-approvals.component.css']
})
export class AdminApprovalsComponent implements OnInit {
  loading = true;
  filter: RequestFilter = 'Pending';
  requests: CategoryRequest[] = [];
  notes: Record<number, string> = {};
  busyId: number | null = null;

  readonly filters: RequestFilter[] = ['Pending', 'Approved', 'Rejected', 'All'];

  constructor(
    private admin: CategoryAdminService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const status = this.filter === 'All' ? '' : this.filter;
    this.admin.getRequests(status).subscribe(requests => {
      this.requests = requests;
      this.loading = false;
    });
  }

  setFilter(filter: RequestFilter): void {
    if (this.filter === filter) return;
    this.filter = filter;
    this.load();
  }

  approve(request: CategoryRequest): void {
    this.busyId = request.id;
    this.admin.approve(request.id, this.notes[request.id] || '').subscribe({
      next: approved => {
        this.busyId = null;
        this.toast.success(`“${approved.name}” is now a live category.`);
        this.load();
      },
      error: err => {
        this.busyId = null;
        this.toast.error(err?.error?.message || 'Could not approve this request.');
      }
    });
  }

  reject(request: CategoryRequest): void {
    this.busyId = request.id;
    this.admin.reject(request.id, this.notes[request.id] || '').subscribe({
      next: rejected => {
        this.busyId = null;
        this.toast.info(`“${rejected.name}” was rejected.`);
        this.load();
      },
      error: err => {
        this.busyId = null;
        this.toast.error(err?.error?.message || 'Could not reject this request.');
      }
    });
  }
}
