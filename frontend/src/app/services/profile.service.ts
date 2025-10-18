import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { API_URL } from '../api';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  //private apiUrl = 'http://127.0.0.1:5000/api/profile/';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  getProfile(): Observable<any> {
    return this.http.get(API_URL, { headers: this.getHeaders() });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(API_URL, data, { headers: this.getHeaders() });
  }
}
