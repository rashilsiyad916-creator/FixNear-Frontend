import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from 'src/models/provider';
import { FixnearService } from '../../services/fixnear.service';
import { ToastService } from '../../services/toast.service';
import { titleCase } from '../../shared/text-case';
import { mapsUrl, hasCoordinates } from '../../shared/maps';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings$: Observable<Booking[]>;
  statusFilter: 'All' | 'Pending' | 'Accepted' | 'Completed' | 'Cancelled' = 'All';
  statusTabs: Array<'All' | 'Pending' | 'Accepted' | 'Completed' | 'Cancelled'> = [
    'All',
    'Pending',
    'Accepted',
    'Completed',
    'Cancelled'
  ];

  readonly stars = [1, 2, 3, 4, 5];
  reviewingId: number | null = null;
  reviewRating = 0;
  reviewComment = '';
  reviewSubmitting = false;
  private reviewedIds = new Set<number>();

  constructor(
    private fixnearService: FixnearService,
    private toast: ToastService
  ) {
    this.bookings$ = this.fixnearService.bookings$;
  }

  ngOnInit(): void {
    this.fixnearService.loadBookings();
  }

  getServiceIcon(service: string): string {
    const icons: Record<string, string> = {
      'Electrician': '⚡',
      'Plumber': '🔧',
      'Mechanic': '🚗',
      'Appliance Repair': '🛠️'
    };
    return icons[service] || '🔧';
  }

  formatService(name: string): string {
    return titleCase(name);
  }

  mapUrl(
    address: string | null | undefined,
    latitude?: number | null,
    longitude?: number | null
  ): string {
    return mapsUrl(address, latitude, longitude);
  }

  hasExactPin(booking: Booking): boolean {
    return hasCoordinates(booking.latitude, booking.longitude);
  }

  hasReview(booking: Booking): boolean {
    return !!booking.hasReview || this.reviewedIds.has(booking.id);
  }

  canReview(booking: Booking): boolean {
    return booking.status === 'Completed' && !this.hasReview(booking);
  }

  startReview(booking: Booking): void {
    this.reviewingId = booking.id;
    this.reviewRating = 0;
    this.reviewComment = '';
  }

  cancelReview(): void {
    this.reviewingId = null;
    this.reviewRating = 0;
    this.reviewComment = '';
  }

  setRating(value: number): void {
    this.reviewRating = value;
  }

  get ratingLabel(): string {
    switch (this.reviewRating) {
      case 1: return 'Not great';
      case 2: return 'Could be better';
      case 3: return 'Good';
      case 4: return 'Great';
      case 5: return 'Excellent';
      default: return 'Tap a star to rate';
    }
  }

  submitReview(booking: Booking): void {
    if (!this.reviewRating) {
      this.toast.error('Choose a star rating first.');
      return;
    }

    this.reviewSubmitting = true;
    this.fixnearService
      .submitReview(booking.id, this.reviewRating, this.reviewComment.trim())
      .subscribe({
        next: () => {
          this.reviewSubmitting = false;
          this.reviewedIds.add(booking.id);
          this.reviewingId = null;
          this.toast.success('Thank you! Your review is now live.');
        },
        error: err => {
          this.reviewSubmitting = false;
          this.toast.error(
            err?.error?.message || 'Could not submit your review. Please try again.'
          );
        }
      });
  }

  setStatusFilter(status: 'All' | 'Pending' | 'Accepted' | 'Completed' | 'Cancelled'): void {
    this.statusFilter = status;
  }

  filterBookings(bookings: Booking[]): Booking[] {
    if (this.statusFilter === 'All') {
      return bookings;
    }
    return bookings.filter(b => b.status === this.statusFilter);
  }

  countByStatus(bookings: Booking[], status: string): number {
    if (status === 'All') {
      return bookings.length;
    }
    return bookings.filter(b => b.status === status).length;
  }

  cancelBooking(id: number): void {
    this.fixnearService.cancelBooking(id).subscribe({
      next: () => this.toast.info('Booking cancelled.'),
      error: err =>
        this.toast.error(
          err?.error?.message || 'Could not cancel the booking.'
        )
    });
  }
}
