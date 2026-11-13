import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  Booking,
  Provider,
  Review,
  ServiceCategory
} from 'src/models/provider';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

const CATEGORY_ICONS: Record<string, string> = {
  'Electrician': '⚡',
  'Plumber': '🔧',
  'Mechanic': '🚗',
  'Appliance Repair': '🛠️',
  'Car Wash': '🚿',
  'Carpenter': '🪚',
  'Painter': '🎨',
  'Cleaning': '🧹',
  'Pest Control': '🐜',
  'AC Repair': '❄️',
  'Gardening': '🌿',
  'Locksmith': '🔐',
  'Solar Fitting': '☀️',
  'Tank Cleaning': '🛢️',
  'Welding': '🔥',
  'Tiling': '🧱',
  'CCTV Installation': '📹',
  'Water Purifier': '💧',
  'House Shifting': '📦',
  'False Ceiling': '🏗️',
  'Mobile Repair': '📱',
  'Laptop Repair': '💻',
  'Pet Grooming': '🐾',
  'Salon at Home': '💇‍♀️',
  'Inverter Service': '🔋',
  'Photography': '📷',
  'Home Nursing': '🩺'
};

interface ProviderDto {
  id: number;
  name: string;
  category: string;
  area: string;
  experience: number;
  rating: number;
  price: number;
  image: string;
  description: string;
  available: boolean;
  verified?: boolean;
  services?: {
    id: number;
    categoryId: number;
    category: string;
    serviceName: string;
    description: string;
    imageUrl?: string | null;
    basePrice: number;
  }[];
}

interface ReviewDto {
  id: number;
  providerId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

interface BookingDto {
  id: number;
  providerId: number;
  providerName: string;
  service: string;
  date: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  hasReview?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FixnearService {
  categories: ServiceCategory[] = [];
  private categoriesLoaded = false;

  providers: Provider[] = [];
  private providersLoaded = false;

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  private favoritesSubject = new BehaviorSubject<number[]>(readFavorites());
  favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.currentUser$.subscribe(user => {
      if (user) this.pullFavoritesFromServer();
    });
  }

  loadCategories(force = false): Observable<ServiceCategory[]> {
    if (this.categoriesLoaded && !force) {
      return of(this.categories);
    }

    return this.http
      .get<any[]>(`${environment.apiUrl}/Categories`)
      .pipe(
        map(items =>
          items.map(c => ({
            id: c.categoryId,
            name: c.name,
            icon: CATEGORY_ICONS[c.name] || '🔧',
            description: c.description || ''
          }))
        ),
        tap(cats => {
          this.categories = cats;
          this.categoriesLoaded = true;
        }),
        catchError(() => of([]))
      );
  }

  loadProviders(force = false): Observable<Provider[]> {
    if (this.providersLoaded && !force) {
      return of(this.providers);
    }

    return this.http
      .get<ProviderDto[]>(`${environment.apiUrl}/Providers`)
      .pipe(
        map(items => items.map(mapProvider)),
        tap(list => {
          this.providers = list;
          this.providersLoaded = true;
        }),
        catchError(() => of(this.providers))
      );
  }

  getProviders(): Provider[] {
    return this.providers;
  }

  getProviderById(id: number): Observable<Provider | undefined> {
    return this.http
      .get<ProviderDto>(`${environment.apiUrl}/Providers/${id}`)
      .pipe(
        map(mapProvider),
        catchError(() => of(undefined))
      );
  }

  getReviewsByProvider(providerId: number): Observable<Review[]> {
    return this.http
      .get<ReviewDto[]>(`${environment.apiUrl}/Providers/${providerId}/reviews`)
      .pipe(
        map(items =>
          items.map(r => ({
            id: r.id,
            providerId: r.providerId,
            author: r.author,
            rating: r.rating,
            comment: r.comment,
            date: r.date
          }))
        ),
        catchError(() => of([] as Review[]))
      );
  }

  searchProviders(category: string, area: string): Provider[] {
    const target = category.trim().toLowerCase();

    return this.providers.filter(provider => {
      const categoryMatches =
        !target ||
        providerCategories(provider).some(
          c => c.toLowerCase() === target
        );

      const areaMatches =
        !area ||
        provider.area.toLowerCase().includes(area.toLowerCase());

      return categoryMatches && areaMatches;
    });
  }

  loadBookings(): void {
    this.http
      .get<BookingDto[]>(`${environment.apiUrl}/Bookings`)
      .pipe(
        map(items => items.map(mapBooking)),
        catchError(() => of(null))
      )
      .subscribe(list => {
        if (list) {
          this.bookingsSubject.next(list);
        }
      });
  }

  addBooking(data: {
    providerId: number;
    providerServiceId?: number;
    date: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    problem: string;
  }): Observable<Booking> {
    return this.http
      .post<BookingDto>(`${environment.apiUrl}/Bookings`, data)
      .pipe(
        map(mapBooking),
        tap(() => this.loadBookings())
      );
  }

  cancelBooking(id: number): Observable<Booking> {
    return this.http
      .put<BookingDto>(`${environment.apiUrl}/Bookings/${id}/cancel`, {})
      .pipe(
        map(mapBooking),
        tap(() => this.loadBookings())
      );
  }

  submitReview(bookingId: number, rating: number, comment: string): Observable<Review> {
    return this.http
      .post<ReviewDto>(`${environment.apiUrl}/Bookings/${bookingId}/review`, {
        rating,
        comment
      })
      .pipe(
        map(r => ({
          id: r.id,
          providerId: r.providerId,
          author: r.author,
          rating: r.rating,
          comment: r.comment,
          date: r.date
        })),
        tap(() => {
          this.loadBookings();
          // Ratings are derived from reviews, so refresh the public cards too.
          this.loadProviders(true).subscribe();
        })
      );
  }

  isFavorite(id: number): boolean {
    return this.favoritesSubject.value.includes(id);
  }

  toggleFavorite(id: number): boolean {
    const current = this.favoritesSubject.value;
    const adding = !current.includes(id);
    const next = adding ? [...current, id] : current.filter(x => x !== id);

    this.persistFavorites(next);

    if (this.auth.isLoggedIn) {
      const request = adding
        ? this.http.post(`${environment.apiUrl}/Favorites/${id}`, {})
        : this.http.delete(`${environment.apiUrl}/Favorites/${id}`);
      request.pipe(catchError(() => of(null))).subscribe();
    }

    return next.includes(id);
  }

  private persistFavorites(ids: number[]): void {
    try {
      localStorage.setItem('fixnear_favorites', JSON.stringify(ids));
    } catch {}
    this.favoritesSubject.next(ids);
  }

  private pullFavoritesFromServer(): void {
    this.http
      .get<number[]>(`${environment.apiUrl}/Favorites`)
      .pipe(catchError(() => of(null)))
      .subscribe(serverIds => {
        if (!serverIds) return;
        const local = this.favoritesSubject.value;
        const merged = [...new Set([...serverIds, ...local])];
        const unsynced = local.filter(id => !serverIds.includes(id));
        this.persistFavorites(merged);
        unsynced.forEach(id =>
          this.http
            .post(`${environment.apiUrl}/Favorites/${id}`, {})
            .pipe(catchError(() => of(null)))
            .subscribe()
        );
      });
  }

  countProvidersByCategory(category: string): number {
    const target = category.trim().toLowerCase();
    return this.providers.filter(p =>
      providerCategories(p).some(c => c.toLowerCase() === target)
    ).length;
  }

  getPopularAreas(): string[] {
    const counts = new Map<string, number>();
    this.providers.forEach(p =>
      counts.set(p.area, (counts.get(p.area) || 0) + 1)
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([area]) => area);
  }
}

function mapProvider(p: ProviderDto): Provider {
  const services = (p.services || []).map(s => ({
    id: s.id,
    categoryId: s.categoryId,
    category: s.category,
    serviceName: s.serviceName,
    description: s.description,
    imageUrl: s.imageUrl ?? null,
    basePrice: Number(s.basePrice)
  }));

  return {
    id: p.id,
    name: p.name,
    category: p.category,
    area: p.area,
    experience: p.experience,
    rating: p.rating,
    price: Number(p.price),
    image: p.image,
    description: p.description,
    available: p.available,
    verified: p.verified ?? false,
    services,
    categories: providerCategories({
      category: p.category,
      services
    } as Provider)
  };
}

/**
 * A provider can offer services in more than one category. The API only gives
 * us the first as `category`, so derive the full list from the service list.
 */
export function providerCategories(provider: Pick<Provider, 'category' | 'services' | 'categories'>): string[] {
  const seen = new Set<string>();
  const list: string[] = [];

  const add = (value?: string | null) => {
    const name = (value || '').trim();
    if (!name || seen.has(name.toLowerCase())) return;
    seen.add(name.toLowerCase());
    list.push(name);
  };

  add(provider.category);
  (provider.categories || []).forEach(add);
  (provider.services || []).forEach(s => add(s.category));

  return list;
}

function mapBooking(b: BookingDto): Booking {
  // The backend auto-completes past bookings, but also normalize here so the
  // UI never shows a stale "Pending" badge if an older API response is cached.
  const isOpen = b.status === 'Pending' || b.status === 'Accepted';
  const status: Booking['status'] =
    isOpen && b.date && b.date < localTodayIso() ? 'Completed' : (b.status as Booking['status']);

  return {
    id: b.id,
    providerId: b.providerId,
    providerName: b.providerName,
    service: b.service,
    date: b.date,
    address: b.address,
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
    status,
    hasReview: !!b.hasReview
  };
}

function localTodayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function readFavorites(): number[] {
  try {
    const raw = localStorage.getItem('fixnear_favorites');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
