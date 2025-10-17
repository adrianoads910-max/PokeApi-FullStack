import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';


@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  imports: [CommonModule, RouterLink, RouterLinkActive],
})
export class Navbar {
  isMenuOpen = false;
  isUserMenuOpen = false;
  user: any = null;

  constructor(private router: Router, private authService: AuthService) {
    this.user = this.authService.getUser();
    this.authService.user$.subscribe((u) => (this.user = u));
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isUserMenuOpen = false;
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isUserMenuOpen = false;
  }

  // ✅ Fecha o menu do usuário ao clicar fora
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative.ml-4')) {
      this.isUserMenuOpen = false;
    }
  }
}
