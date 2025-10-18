import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true, // importante se for componente standalone
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
  imports: [CommonModule],
})
export class Users implements OnInit {
  usuarios: any[] = [];
  loading = true;
  errorMsg = '';

  // ✅ Base URL do backend Flask
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  // 🔁 Busca os usuários da API Flask
  loadUsuarios(): void {
    console.log('📡 Buscando usuários em', `${this.apiUrl}/api/users`);

    this.http.get<any[]>(`${this.apiUrl}/api/users`).subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
        console.log('✅ Usuários carregados com sucesso:')//, data);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 403) {
          this.errorMsg = '⚠️ Acesso negado. Apenas administradores podem ver esta página.';
        } else if (err.status === 401) {
          this.errorMsg = '🚫 Sessão expirada. Faça login novamente.';
        } else if (err.status === 0) {
          this.errorMsg = '❌ Falha de conexão com o servidor. Verifique se o backend Flask está rodando.';
        } else {
          this.errorMsg = `Erro inesperado: ${err.message || err.statusText}`;
        }

        console.error('❌ Erro ao carregar usuários:', err);
      },
    });
  }
}
