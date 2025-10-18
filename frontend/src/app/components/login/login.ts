import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth'; // ajuste o caminho conforme sua estrutura

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule]
})
export class Login {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Manipula o envio do formulário de login.
   */
  onSubmit(form?: NgForm): void {
    if (form && form.invalid) {
      this.message = 'Por favor, preencha todos os campos.';
      return;
    }

   // console.log('📤 Enviando login:', {
   //   email: this.email,
   //   password: this.password
   // });

    // 🔧 Chamada compatível com AuthService.login(email, password)
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        //console.log('📥 Resposta do backend:', response);

        // ✅ Detecta token em qualquer formato
        const token =
          response?.access_token ||
          response?.token ||
          response?.data?.token ||
          null;

        //console.log('🔍 Token detectado:', token);

        if (token) {
          // Salva token e usuário no localStorage
          localStorage.setItem('token', token);
          if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
          }

          console.log('✅ Token salvo com sucesso!');
          this.message = response.msg || 'Login realizado com sucesso!';

          // Redireciona para a página principal
          this.router.navigate(['/home']);
        } else {
          console.error('❌ Nenhum token recebido!');
          console.log('🧩 Estrutura da resposta:', JSON.stringify(response, null, 2));
          this.message = 'Erro: o servidor não retornou um token válido.';
        }
      },
      error: (err) => {
        console.error('🚫 Erro na requisição:', err);
        this.message =
          err.error?.message ||
          'Erro ao tentar fazer login. Verifique suas credenciais.';
      }
    });
  }
}
