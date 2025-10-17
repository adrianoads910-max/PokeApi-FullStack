import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuthLoginResponse {
  access_token?: string;   // formato novo (recomendado)
  token?: string;          // formato legado
  user?: {
    id?: number;
    name?: string;
    email?: string;
    nickname?: string;
    [k: string]: any;
  };
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000';

  // estado reativo do usuário
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ========== AUTH CORE ==========

  /** Efetua login no backend e atualiza token + usuário (nome incluso) */
  login(email: string, password: string): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.applyLoginResponse(res, email))
    );
  }

  /** Registro de usuário (ajuste o payload conforme seu backend) */
  register(data: { name: string; email: string; password: string; nickname?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** Logout total: limpa token e usuário e notifica os assinantes */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  // ========== STATE HELPERS ==========

  /** Define/atualiza o usuário atual e emite para quem estiver assinando user$ */
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Limpa apenas usuário (use logout() para limpar tudo) */
  clearUser(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /** Retorna o usuário salvo (ou null) */
  getUser(): any {
    return this.getUserFromStorage();
  }

  /** Retorna o token JWT salvo (ou null) */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Informa se há um token persistido */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Headers com Authorization para chamadas autenticadas */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // ========== INTERNALS ==========

  /** Aplica resposta de login em localStorage e emite user$ */
  private applyLoginResponse(res: AuthLoginResponse, emailFallback: string): void {
    // Token (suporta formato novo e legado)
    const token = res?.access_token || res?.token || null;
    if (token) {
      localStorage.setItem('token', token);
    }

    // Usuário
    let user = res?.user;
    if (!user) {
      // fallback caso backend não retorne user (minimamente útil para navbar)
      const nameFromEmail = emailFallback?.includes('@') ? emailFallback.split('@')[0] : emailFallback || 'Usuário';
      user = { email: emailFallback, name: nameFromEmail };
    }

    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Lê usuário do localStorage com segurança */
  private getUserFromStorage(): any {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      // se alguém gravou algo inválido no localStorage, limpamos e seguimos
      localStorage.removeItem('user');
      return null;
    }
  }
}
