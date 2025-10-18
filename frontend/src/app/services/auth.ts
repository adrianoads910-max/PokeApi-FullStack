import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interface para resposta do backend no login
 */
export interface AuthLoginResponse {
  access_token?: string;   // formato novo (JWT moderno)
  token?: string;          // formato legado (para compatibilidade)
  user?: {
    id?: number;
    name?: string;
    email?: string;
    nickname?: string;
    is_admin?: boolean;
    role?: string;
    [k: string]: any;
  };
  [k: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:5000'; // ajuste se necessário

  /** Estado reativo do usuário logado */
  private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  // =============================
  // 🔹 MÉTODOS PRINCIPAIS DE AUTH
  // =============================

  /** Login no backend e atualização de token + usuário */
  login(email: string, password: string): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => this.applyLoginResponse(res, email))
    );
  }

  /** Registro de usuário (ajuste payload conforme backend) */
  register(data: { name: string; email: string; password: string; nickname?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  /** Logout completo: limpa token e usuário */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  // =============================
  // 🔹 MÉTODOS DE ESTADO / USUÁRIO
  // =============================

  /** Atualiza o usuário atual e emite para quem estiver ouvindo o observable */
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Limpa apenas usuário (mantendo token, se houver) */
  clearUser(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /** Retorna o usuário salvo localmente */
  getUser(): any {
    return this.getUserFromStorage();
  }

  /** Retorna o token JWT armazenado */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /** Informa se há token ativo */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Headers padrão com Authorization */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  /** 🔸 Verifica se o usuário logado é admin */
  get isAdmin(): boolean {
    const user = this.getUser();
    return user?.is_admin === true || user?.role === 'admin';
  }

  // =============================
  // 🔹 MÉTODOS INTERNOS (privados)
  // =============================

  /** Processa a resposta do backend e armazena token + usuário */
  private applyLoginResponse(res: AuthLoginResponse, emailFallback: string): void {
    // Token (aceita formato novo e legado)
    const token = res?.access_token || res?.token || null;
    if (token) {
      localStorage.setItem('token', token);
    }

    // Usuário (preferencialmente retornado pelo backend)
    let user = res?.user;
    if (!user) {
      // fallback mínimo para casos onde o backend não envia user
      const nameFromEmail = emailFallback?.includes('@')
        ? emailFallback.split('@')[0]
        : emailFallback || 'Usuário';
      user = { email: emailFallback, name: nameFromEmail, is_admin: false };
    }

    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** Recupera usuário do localStorage com segurança */
  private getUserFromStorage(): any {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }
}
