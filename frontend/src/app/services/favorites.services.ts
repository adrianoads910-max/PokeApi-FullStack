import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000';
  private userSubject = new BehaviorSubject<any>(this.getUser());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Faz login e armazena token + dados do usuário
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        if (response && response.access_token) {
          // Salva o token
          localStorage.setItem('token', response.access_token);

          // Salva dados do usuário no localStorage
          const userData = response.user || {
            email: response.email,
            name: response.name || email.split('@')[0]
          };

          localStorage.setItem('user', JSON.stringify(userData));

          // Atualiza observable global
          this.userSubject.next(userData);
        }
      })
    );
  }

  // Retorna o token salvo
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Retorna o usuário atual (parseado)
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Verifica se há token
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Faz logout limpando tudo
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }
}
