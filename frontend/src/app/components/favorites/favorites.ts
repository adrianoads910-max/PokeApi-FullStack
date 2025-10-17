import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class Favorites implements OnInit {
  apiUrl = 'http://localhost:5000'; // ajuste se o backend estiver em outra porta
  favorites: any[] = [];
  loading = false;
  selectedPokemon: any = null;
  showModal = false;
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadFavorites();
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
        this.favorites = data;
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

    this.http.delete(`${this.apiUrl}/api/favorites/${pokemonId}`, { headers }).subscribe({
      next: () => {
        console.log('🗑️ Removido dos favoritos:', pokemonId);
        this.favorites = this.favorites.filter(f => f.pokemon_id !== pokemonId);
      },
      error: (err) => {
        console.error('❌ Erro ao remover favorito:', err);
      }
    });
  }

  // ==========================================================
  // 🔍 VER DETALHES DO POKÉMON (opcional, modal simples)
  // ==========================================================
  viewDetails(pokemon: any): void {
    this.selectedPokemon = pokemon;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  // ==========================================================
  // 🎨 COR DOS TIPOS (igual ao list.ts)
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
  const color = colors[type?.toLowerCase()] || 'bg-gray-300';
  // Retorna sempre cor sólida — sem opacidade nem /30
  return color;
}


  // ==========================================================
  // 🚪 LOGOUT
  // ==========================================================
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
