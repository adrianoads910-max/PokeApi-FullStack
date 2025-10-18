import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '../../api';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DecimalPipe],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class List implements OnInit {
  showModal = false;
  selectedPokemon: any = null;
  loadingDetails = false;
  pokemons: any[] = [];

  generation = '';
  type = '';
  manualSearchTerm = '';

  typesList = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting',
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost',
    'Dragon', 'Steel', 'Dark', 'Fairy'
  ];

  generationsList = [
    { id: '', name: 'Todas' },
    { id: '1', name: 'Geração 1' },
    { id: '2', name: 'Geração 2' },
    { id: '3', name: 'Geração 3' },
    { id: '4', name: 'Geração 4' },
    { id: '5', name: 'Geração 5' },
    { id: '6', name: 'Geração 6' },
    { id: '7', name: 'Geração 7' },
    { id: '8', name: 'Geração 8' },
  ];

  loading = false;
  message = '';
  totalCount = 0;
  favorites: any[] = [];
  equipe: any[] = [];

  //private apiUrl = 'http://127.0.0.1:5000';
  
  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.generation = '1';
    this.searchPokemon();
    this.loadFavorites();
    this.loadEquipe();
  }

  // ==========================================================
  // 🔍 BUSCA E FILTROS
  // ==========================================================
  activeCategory: 'todos' | 'favoritos' | 'equipe' = 'todos';

  searchManual(): void {
    const term = this.manualSearchTerm.trim().toLowerCase();
    if (!term) {
      this.message = 'Digite um nome ou ID de Pokémon para buscar.';
      return;
    }

    this.loading = true;
    this.http.get(`${API_URL}/pokemon/search/${term}`).subscribe({
      next: (response: any) => {
        this.pokemons = [response];
        this.totalCount = 1;
        this.message = `Resultado para: ${response.name}`;
        this.loading = false;
      },
      error: (err: any) => {
        this.pokemons = [];
        this.totalCount = 0;
        this.message = err.error?.msg || `Pokémon '${term}' não encontrado.`;
        this.loading = false;
      }
    });
  }

  searchPokemon(): void {
    this.loading = true;
    const params: any = {};
    if (this.generation) params['generation'] = this.generation;
    if (this.type) params['type'] = this.type.toLowerCase();

    this.http.get(`${API_URL}/pokemon/filter`, { params }).subscribe({
      next: (response: any) => {
        this.pokemons = response.results || [];

        // Ordenar: Equipe → Favoritos → Restantes
        this.pokemons.sort((a, b) => {
          const aEquipe = this.isEquip(a.id) ? 1 : 0;
          const bEquipe = this.isEquip(b.id) ? 1 : 0;
          const aFav = this.isFavorite(a.id) ? 1 : 0;
          const bFav = this.isFavorite(b.id) ? 1 : 0;
          return (bEquipe - aEquipe) || (bFav - aFav);
        });

        this.totalCount = this.pokemons.length;
        this.loading = false;
      },
      error: () => {
        this.pokemons = [];
        this.totalCount = 0;
        this.loading = false;
      }
    });
  }

  selectGeneration(selectedGenId: string): void {
    this.generation = this.generation === selectedGenId ? '' : selectedGenId;
    this.searchPokemon();
  }

  selectType(selectedType: string): void {
    this.type = this.type === selectedType ? '' : selectedType;
    this.searchPokemon();
  }

  clearFilters(): void {
    this.generation = '';
    this.type = '';
    this.manualSearchTerm = '';
    this.searchPokemon();
  }

  filterByCategory(category: 'todos' | 'favoritos' | 'equipe'): void {
    this.activeCategory = category;

    if (category === 'favoritos') {
      this.pokemons = [...this.favorites];
      this.totalCount = this.pokemons.length;
      this.message = 'Exibindo apenas seus Pokémon favoritos.';
    } else if (category === 'equipe') {
      this.pokemons = [...this.equipe];
      this.totalCount = this.pokemons.length;
      this.message = 'Exibindo sua equipe.';
    } else {
      this.searchPokemon();
    }
  }

  getFilterStyle(isSelected: boolean): string {
    return isSelected
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm';
  }

  // ==========================================================
  // ⭐ FAVORITOS
  // ==========================================================
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadFavorites(): void {
    const headers = this.getAuthHeaders();
    this.http.get(`${API_URL}/api/favorites/`, { headers }).subscribe({
      next: (data: any) => this.favorites = data,
      error: (err: any) => console.error('Erro ao carregar favoritos:', err)
    });
  }

  isFavorite(pokemonId: number): boolean {
    return this.favorites.some(f => f.id === pokemonId);
  }

  toggleFavorite(pokemon: any): void {
    const headers = this.getAuthHeaders();

    if (this.isFavorite(pokemon.id)) {
      this.http.delete(`${API_URL}/api/favorites/${pokemon.id}`, { headers }).subscribe({
        next: () => this.favorites = this.favorites.filter(f => f.id !== pokemon.id),
        error: (err) => console.error('Erro ao remover favorito:', err)
      });
    } else {
      const payload = {
        id: pokemon.id,
        name: pokemon.name,
        sprite_url: pokemon.sprite_url,
        height: pokemon.height,
        weight: pokemon.weight,
        abilities: pokemon.abilities,
        stats: pokemon.stats,
        types: pokemon.types
      };
      this.http.post(`${API_URL}/api/favorites/`, payload, { headers }).subscribe({
        next: () => this.favorites.push(payload),
        error: (err) => console.error('Erro ao adicionar favorito:', err)
      });
    }
  }

  // ==========================================================
  // 🕹️ EQUIPE
  // ==========================================================
  loadEquipe(): void {
    const headers = this.getAuthHeaders();
    this.http.get(`${API_URL}/api/equipe/`, { headers }).subscribe({
      next: (data: any) => this.equipe = data,
      error: (err) => console.error('Erro ao carregar equipe:', err)
    });
  }

  isEquip(pokemonId: number): boolean {
    return this.equipe.some(e => e.id === pokemonId);
  }

  toggleEquip(pokemon: any): void {
    const headers = this.getAuthHeaders();

    if (this.isEquip(pokemon.id)) {
      this.http.delete(`${API_URL}/api/equipe/${pokemon.id}`, { headers }).subscribe({
        next: () => this.equipe = this.equipe.filter(e => e.id !== pokemon.id),
        error: (err) => console.error('Erro ao remover da equipe:', err)
      });
    } else {
      const payload = {
        id: pokemon.id,
        name: pokemon.name,
        sprite_url: pokemon.sprite_url,
        height: pokemon.height,
        weight: pokemon.weight,
        abilities: pokemon.abilities,
        stats: pokemon.stats,
        types: pokemon.types
      };
      this.http.post(`${API_URL}/api/equipe/`, payload, { headers }).subscribe({
        next: () => this.equipe.push(payload),
        error: (err) => {
          if (err.status === 400 && err.error.msg.includes('6 Pokémon')) {
            alert('⚠️ Sua equipe já possui 6 Pokémon!');
          } else {
            console.error('Erro ao adicionar à equipe:', err);
          }
        }
      });
    }
  }

  onPokeballClick(pokemon: any): void {
    this.toggleEquip(pokemon);
  }

  // ==========================================================
  // ⚙️ DETALHES E MODAL
  // ==========================================================
  viewDetails(pokemonId: number): void {
    this.loadingDetails = true;
    this.showModal = true;
    this.selectedPokemon = null;

    this.http.get(`${API_URL}/pokemon/search/${pokemonId}`).subscribe({
      next: (data: any) => {
        this.selectedPokemon = data;
        this.loadingDetails = false;
      },
      error: () => this.loadingDetails = false
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPokemon = null;
  }

  // ==========================================================
  // 🎨 CORES E ESTILOS
  // ==========================================================
  getTypeColor(type: string, filled = false): string {
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

  getStatWidth(statValue: number): number {
    return Math.min((statValue / 255) * 100, 100);
  }
}
