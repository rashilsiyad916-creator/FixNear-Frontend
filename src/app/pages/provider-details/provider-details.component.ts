
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Provider, Review } from 'src/models/provider';
import { AuthService } from '../../services/auth.service';
import { FixnearService, providerCategories } from '../../services/fixnear.service';
import { ToastService } from '../../services/toast.service';
import { serviceImageUrl } from '../../shared/service-image';
import { titleCase } from '../../shared/text-case';
import { mapsUrl } from '../../shared/maps';

@Component({
  selector: 'app-provider-details',
  templateUrl: './provider-details.component.html',
  styleUrls: ['./provider-details.component.css']
})
export class ProviderDetailsComponent implements OnInit {
  provider?: Provider;
  reviews: Review[] = [];
  selectedServiceId: number | null = null;
  date = '';
  address = '';
  problem = '';
  message = '';
  bookingSuccess = false;
  submitted = false;
  locationStatus: 'idle' | 'locating' | 'found' | 'error' = 'idle';
  bookingLat: number | null = null;
  bookingLng: number | null = null;
  readonly problemMax = 500;

  today = new Date().toISOString().slice(0, 10);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private fixnearService: FixnearService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Carry the area the customer searched for into the booking form so the
    // saved location matches where they actually want the service.
    const searchedArea = this.route.snapshot.queryParamMap.get('area');
    if (searchedArea) this.address = searchedArea.trim();

    this.fixnearService.getProviderById(id).subscribe(provider => {
      this.provider = provider;
      this.selectedServiceId = provider?.services?.length
        ? provider.services[0].id
        : null;
    });
    this.fixnearService.getReviewsByProvider(id).subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  avgReviewRating(): number {
    if (!this.reviews.length) return 0;
    return this.reviews.reduce((s, r) => s + r.rating, 0) / this.reviews.length;
  }

  get problemLength(): number {
    return this.problem.length;
  }

  get categories(): string[] {
    return this.provider ? providerCategories(this.provider) : [];
  }

  get extraCategories(): string[] {
    return this.categories.slice(1);
  }

  formatService(name: string): string {
    return titleCase(name);
  }

  get selectedService() {
    if (!this.provider?.services?.length) return null;
    return (
      this.provider.services.find(s => s.id === this.selectedServiceId) ||
      this.provider.services[0]
    );
  }

  get displayPrice(): number {
    return this.selectedService?.basePrice ?? this.provider?.price ?? 0;
  }

  get selectedServiceImage(): string {
    return serviceImageUrl(
      this.selectedService?.imageUrl,
      this.selectedService?.category ?? this.provider?.category
    );
  }

  get providerProfileImage(): string {
    return serviceImageUrl(this.provider?.image, this.provider?.category);
  }

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = serviceImageUrl(null, this.provider?.category);
    if (img && img.src !== new URL(fallback, document.baseURI).href) {
      img.src = fallback;
    }
  }

  onServiceImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const fallback = serviceImageUrl(null, this.selectedService?.category ?? this.provider?.category);
    if (img && img.src !== new URL(fallback, document.baseURI).href) {
      img.src = fallback;
    }
  }

  selectService(id: number): void {
    this.selectedServiceId = id;
  }

  invalid(field: 'date' | 'address' | 'problem'): boolean {
    if (!this.submitted) return false;
    if (field === 'date') return !this.date;
    if (field === 'address') return !this.address.trim();
    return !this.problem.trim();
  }

  isFavorite(): boolean {
    return this.provider ? this.fixnearService.isFavorite(this.provider.id) : false;
  }

  toggleFavorite(event: Event): void {
    event.preventDefault();
    if (!this.provider) return;
    const added = this.fixnearService.toggleFavorite(this.provider.id);
    this.toast.info(
      added
        ? `♥ ${this.provider.name} saved to favorites`
        : `Removed ${this.provider.name} from favorites`
    );
  }

  shareProvider(): void {
    if (!this.provider) return;
    const url = window.location.href;
    const data = {
      title: `${this.provider.name} · FixNear`,
      text: `Check out ${this.provider.name} — ${this.provider.category} in ${this.provider.area}`,
      url
    };

    if (navigator.share) {
      navigator.share(data).catch(err => {
        if (err && err.name === 'AbortError') return;
        this.copyLink(url);
      });
      return;
    }

    this.copyLink(url);
  }

  private copyLink(url: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => this.toast.success('Profile link copied to clipboard!'),
        () => this.toast.error('Could not copy the link.')
      );
    } else {
      this.toast.info(url);
    }
  }

  scrollToBooking(): void {
    document.getElementById('booking-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  mapUrl(value: string | null | undefined): string {
    return mapsUrl(value);
  }

  bookingMapUrl(): string {
    return mapsUrl(this.address, this.bookingLat, this.bookingLng);
  }

  get hasExactLocation(): boolean {
    return this.bookingLat !== null && this.bookingLng !== null;
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationStatus = 'error';
      this.toast.error('Location is not supported here. Please type your address.');
      return;
    }

    this.locationStatus = 'locating';
    navigator.geolocation.getCurrentPosition(
      position => {
        // Keep the raw GPS fix even if the address lookup fails — this is what
        // lets both the customer and the provider open the exact spot on a map.
        this.bookingLat = position.coords.latitude;
        this.bookingLng = position.coords.longitude;
        this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      },
      () => {
        this.locationStatus = 'error';
        this.toast.error('Could not detect your location. Please type your address.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  private reverseGeocode(lat: number, lon: number): void {
    const coords = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    // Convert coordinates into a readable address; if the lookup is blocked,
    // still keep the exact coordinates so the professional can find the spot.
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&lat=${lat}&lon=${lon}`)
      .then(response => (response.ok ? response.json() : Promise.reject(new Error('geocode failed'))))
      .then((data: { display_name?: string }) => {
        this.address = (data?.display_name || this.address || coords).trim();
        this.locationStatus = 'found';
        this.toast.success('Exact location added to your booking.');
      })
      .catch(() => {
        if (!this.address.trim()) this.address = coords;
        this.locationStatus = 'found';
        this.toast.info('Exact GPS location saved — add a landmark or flat number.');
      });
  }

  bookService(): void {
    this.submitted = true;

    if (!this.provider || !this.date || !this.address.trim() ||
        !this.problem.trim()) {
      this.message = 'Please complete all booking fields.';
      return;
    }

    if (this.problem.length > this.problemMax) {
      this.message = `Description must be ${this.problemMax} characters or fewer.`;
      return;
    }

    if (!this.provider.available) {
      this.message = 'This provider is currently unavailable.';
      return;
    }

    if (!this.authService.isLoggedIn) {
      this.message = 'Please log in to book this service.';
      this.toast.error('Please log in to book this service.');
      return;
    }

    this.message = '';
    this.fixnearService
      .addBooking({
        providerId: this.provider.id,
        providerServiceId: this.selectedService?.id,
        date: this.date,
        address: this.address.trim(),
        latitude: this.bookingLat,
        longitude: this.bookingLng,
        problem: this.problem.trim()
      })
      .subscribe({
        next: () => {
          this.bookingSuccess = true;
          this.toast.success(`Booking request sent to ${this.provider!.name}!`);
          this.date = '';
          this.address = '';
          this.problem = '';
          this.bookingLat = null;
          this.bookingLng = null;
          this.locationStatus = 'idle';

          setTimeout(() => {
            this.router.navigate(['/my-bookings']);
          }, 1600);
        },
        error: err => {
          this.message =
            err?.error?.message || 'Could not create the booking. Please try again.';
          this.toast.error(this.message);
        }
      });
  }
}
