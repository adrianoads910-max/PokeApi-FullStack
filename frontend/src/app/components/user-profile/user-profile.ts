import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css'],
  imports: [CommonModule, RouterLink, FormsModule]
})
export class UserProfile implements OnInit {
  user = { name: '', nickname: '', email: '', password: '' };
  message: string = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }


  loadUser(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
        console.log('✅ Perfil carregado:', this.user);
      },
      error: (err) => {
        console.error('❌ Erro ao carregar perfil:', err);
        this.message = 'Erro ao carregar dados do usuário.';
      },
    });
  }

  onSave(form?: NgForm): void {
    if (form && form.invalid) {
      this.message = 'Preencha todos os campos obrigatórios.';
      return;
    }

    

    this.profileService.updateProfile(this.user).subscribe({
      next: (res) => {
        console.log('✅ Perfil atualizado:', res);
        this.message = res.msg || 'Dados atualizados com sucesso!';
      },
      error: (err) => {
        console.error('🚫 Erro ao atualizar perfil:', err);
        this.message = 'Erro ao salvar os dados.';
      },
    });
  }
}
