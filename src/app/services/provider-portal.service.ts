import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  ProviderBooking,
  ProviderProfile,
  ProviderProfileRequest,
  ProviderServiceOffering,
  ProviderServiceRequest,
  ProviderStats,
  Review,
  ImageUploadResponse,
  CategoryRequest,
  CreateCategoryRequest
} from 'src/models/provider';

@Injectable({ providedIn: 'root' })
export class ProviderPortalService {
  private apiUrl = `${environment.apiUrl}/provider`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ProviderProfile | null> {
    return this.http
      .get<ProviderProfile>(`${this.apiUrl}/me`)
      .pipe(catchError(() => of(null)));
  }

  saveProfile(request: ProviderProfileRequest): Observable<ProviderProfile> {
    return this.http.post<ProviderProfile>(`${this.apiUrl}/me`, request);
  }

  uploadPhoto(file: File): Observable<ImageUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/me/photo`, form);
  }

  uploadServicePhoto(file: File): Observable<ImageUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/services/photo`, form);
  }

  getServices(): Observable<ProviderServiceOffering[]> {
    return this.http
      .get<ProviderServiceOffering[]>(`${this.apiUrl}/services`)
      .pipe(catchError(() => of([])));
  }

  addService(request: ProviderServiceRequest): Observable<ProviderServiceOffering> {
    return this.http.post<ProviderServiceOffering>(`${this.apiUrl}/services`, request);
  }

  updateService(
    id: number,
    request: ProviderServiceRequest
  ): Observable<ProviderServiceOffering> {
    return this.http.put<ProviderServiceOffering>(
      `${this.apiUrl}/services/${id}`,
      request
    );
  }

  deleteService(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.apiUrl}/services/${id}`);
  }

  getBookings(): Observable<ProviderBooking[]> {
    return this.http
      .get<ProviderBooking[]>(`${this.apiUrl}/bookings`)
      .pipe(catchError(() => of([])));
  }

  updateBookingStatus(
    id: number,
    status: string
  ): Observable<ProviderBooking> {
    return this.http.put<ProviderBooking>(
      `${this.apiUrl}/bookings/${id}/status`,
      { status }
    );
  }

  setAvailability(available: boolean): Observable<{ available: boolean }> {
    return this.http.put<{ available: boolean }>(`${this.apiUrl}/availability`, {
      available
    });
  }

  getStats(): Observable<ProviderStats | null> {
    return this.http
      .get<ProviderStats>(`${this.apiUrl}/stats`)
      .pipe(catchError(() => of(null)));
  }

  getReviews(): Observable<Review[]> {
    return this.http
      .get<Review[]>(`${this.apiUrl}/reviews`)
      .pipe(catchError(() => of([])));
  }

  getCategoryRequests(): Observable<CategoryRequest[]> {
    return this.http
      .get<CategoryRequest[]>(`${this.apiUrl}/category-requests`)
      .pipe(catchError(() => of([])));
  }

  requestCategory(request: CreateCategoryRequest): Observable<CategoryRequest> {
    return this.http.post<CategoryRequest>(`${this.apiUrl}/category-requests`, request);
  }
}
