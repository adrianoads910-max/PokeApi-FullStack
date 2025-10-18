import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class Favorites implements OnInit {
  apiUrl = 'http://localhost:5000';
  favorites: any[] = [];
  loading = false;
  selectedPokemon: any = null;
  showModal = false;
  message = '';
  loadingDetails = false; // 🆕 controla o carregamento do modal

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFavorites();
  }
// Calcula a largura da barra de status base
getStatWidth(value: number): number {
  // valor máximo aproximado de stats em Pokémon
  const maxStat = 255;
  return Math.min(100, Math.round((value / maxStat) * 100));
}

  // ==========================================================
  // 🔐 AUTH HEADER
  // ==========================================================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ==========================================================
  // ⭐ CARREGAR FAVORITOS
  // ==========================================================
  loadFavorites(): void {
    this.loading = true;
    const headers = this.getAuthHeaders();

    this.http.get<any[]>(`${this.apiUrl}/api/favorites/`, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Favoritos carregados:', data);
        this.favorites = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar favoritos:', err);
        this.loading = false;
      }
    });
  }

  // ==========================================================
  // 🗑️ REMOVER FAVORITO
  // ==========================================================
  removeFavorite(pokemonId: number): void {
    const headers = this.getAuthHeaders();
    const id = pokemonId || 0;

    if (!id) {
      console.warn('⚠️ ID do Pokémon inválido para remoção.');
      return;
    }

    this.http.delete(`${this.apiUrl}/api/favorites/${id}`, { headers }).subscribe({
      next: () => {
        console.log('🗑️ Removido dos favoritos:', id);
        this.favorites = this.favorites.filter(f => f.pokemon_id !== id && f.id !== id);
        this.favorites = [...this.favorites]; // força re-renderização
      },
      error: (err) => {
        console.error('❌ Erro ao remover favorito:', err);
      }
    });
  }

  // ==========================================================
  // 🔍 VER DETALHES DO POKÉMON (AJUSTADO)
  // ==========================================================
  viewDetails(pokemon: any): void {
    const id = pokemon.pokemon_id || pokemon.id;
    if (!id) return;

    this.loadingDetails = true;
    this.showModal = true;
    this.selectedPokemon = null;

    this.http.get(`${this.apiUrl}/pokemon/search/${id}`).subscribe({
      next: (data: any) => {
        this.selectedPokemon = data;
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar detalhes:', err);
        this.loadingDetails = false;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPokemon = null;
  }

  // ==========================================================
  // 🎨 COR DOS TIPOS
  // ==========================================================
  getTypeColor(type: string, filled: boolean): string {
    const colors: any = {
      fire: 'bg-red-500', water: 'bg-blue-500', grass: 'bg-green-500',
      electric: 'bg-yellow-400', normal: 'bg-gray-400', bug: 'bg-lime-500',
      poison: 'bg-purple-500', ground: 'bg-yellow-700', fairy: 'bg-pink-400',
      psychic: 'bg-pink-500', rock: 'bg-yellow-800', ice: 'bg-cyan-400',
      fighting: 'bg-orange-600', dragon: 'bg-indigo-700', dark: 'bg-gray-800',
      steel: 'bg-gray-500', ghost: 'bg-violet-700', flying: 'bg-sky-400'
    };
    return colors[type?.toLowerCase()] || 'bg-gray-300';
  }

  // ==========================================================
  // 🚪 LOGOUT
  // ==========================================================
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
