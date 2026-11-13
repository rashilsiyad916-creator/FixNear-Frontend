import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CategoryRequest } from 'src/models/provider';

@Injectable({ providedIn: 'root' })
export class CategoryAdminService {
  private apiUrl = `${environment.apiUrl}/admin/category-requests`;

  constructor(private http: HttpClient) {}

  getRequests(status = 'Pending'): Observable<CategoryRequest[]> {
    const params = new HttpParams().set('status', status);
    return this.http
      .get<CategoryRequest[]>(this.apiUrl, { params })
      .pipe(catchError(() => of([])));
  }

  approve(id: number, note = ''): Observable<CategoryRequest> {
    return this.http.put<CategoryRequest>(`${this.apiUrl}/${id}/approve`, { note });
  }

  reject(id: number, note = ''): Observable<CategoryRequest> {
    return this.http.put<CategoryRequest>(`${this.apiUrl}/${id}/reject`, { note });
  }
}
