import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking } from 'src/models/provider';
import { AuthService } from '../../services/auth.service';
import { FixnearService } from '../../services/fixnear.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  bookings$: Observable<Booking[]>;

  constructor(
    public authService: AuthService,
    public fixnearService: FixnearService
  ) {
    this.bookings$ = this.fixnearService.bookings$;
  }

  ngOnInit(): void {
    this.fixnearService.loadBookings();
    this.fixnearService.loadProviders().subscribe();
  }

  getPendingCount(): number {
    const bookings = (this.fixnearService as any).bookingsSubject?.value || [];
    return bookings.filter((b: Booking) => b.status === 'Pending').length;
  }

  isCustomer(): boolean {
    return this.authService.currentUser?.role === 'Customer';
  }
}
