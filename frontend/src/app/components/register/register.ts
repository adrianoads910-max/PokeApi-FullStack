import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { API_URL } from '../../api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  nickname = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';

  //private apiUrl = 'http://127.0.0.1:5000'; // Flask backend
  private API_URL = 'https://pokeapi-fullstack.onrender.com';

  constructor(private http: HttpClient, private router: Router) {}

  handleRegister() {
    if (this.password !== this.confirmPassword) {
      this.message = 'As senhas não coincidem!';
      return;
    }

    const data = {
      name: this.name,
      nickname: this.nickname,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    this.http.post(`${API_URL}/register`, data).subscribe({
      next: (res: any) => {
        this.message = res.msg || 'Cadastro realizado com sucesso!';
        this.clearForm();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.message = err.error?.msg || 'Erro ao cadastrar usuário.';
      }
    });
  }

  clearForm() {
    this.name = '';
    this.nickname = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
  }
}
