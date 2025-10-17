import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, DecimalPipe],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  showModal: boolean = false;
  selectedPokemon: any = null;
  loadingDetails: boolean = false;
  pokemons: any[] = [];

  generation: string = '';
  type: string = '';
  manualSearchTerm: string = '';

  typesList: string[] = [
    'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting',
    'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost',
    'Dragon', 'Steel', 'Dark', 'Fairy'
  ];

  generationsList: { id: string, name: string }[] = [
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

  loading: boolean = false;
  message: string = '';
  totalCount: number = 0;
  favorites: any[] = [];

  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.generation = '1';
    this.searchPokemon();
    this.loadFavorites();
  }

  // ==========================================================
  // ============ 🔍 FUNÇÕES DE BUSCA E FILTRO ================
  // ==========================================================

  searchManual(): void {
    const term = this.manualSearchTerm.trim().toLowerCase();
    if (!term) {
      this.message = 'Digite um nome ou ID de Pokémon para buscar.';
      return;
    }
    this.loading = true;
    this.message = '';
    this.generation = '';
    this.type = '';
    this.http.get(`${this.apiUrl}/pokemon/search/${term}`).subscribe({
      next: (response: any) => {
        this.pokemons = [response];
        this.totalCount = 1;
        this.loading = false;
        this.message = `Resultado para: ${response.name}`;
      },
      error: (err: any) => {
        this.pokemons = [];
        this.totalCount = 0;
        this.message = err.error?.msg || `Pokémon '${term}' não encontrado.`;
        this.loading = false;
        console.error('Erro na API:', err);
      }
    });
  }

  searchPokemon(): void {
    this.loading = true;
    this.message = '';
    this.manualSearchTerm = '';

    if (!this.generation && !this.type) {
      this.generation = '1';
    }

    const params: { [key: string]: string } = {};
    if (this.generation) params['generation'] = this.generation;
    if (this.type) params['type'] = this.type.toLowerCase();

    this.http.get(`${this.apiUrl}/pokemon/filter`, { params }).subscribe({
      next: (response: any) => {
        this.pokemons = response.results || [];
        this.totalCount = response.count || 0;
        this.message = response.msg || '';
        this.loading = false;
      },
      error: (err: any) => {
        this.pokemons = [];
        this.totalCount = 0;
        this.message = err.error?.msg || 'Erro ao buscar Pokémons.';
        this.loading = false;
        console.error('Erro na API:', err);
      }
    });
  }

  // ==========================================================
  // ============ 🌟 FUNÇÕES DE FAVORITOS =====================
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
    this.http.get(`${this.apiUrl}/api/favorites/`, { headers }).subscribe({
      next: (data: any) => {
        console.log('✅ Favoritos carregados:', data);
        this.favorites = data;
      },
      error: (err: any) => {
        console.error('❌ Erro ao carregar favoritos:', err);
      }
    });
  }

  isFavorite(pokemonId: number): boolean {
    return this.favorites.some(f => f.pokemon_id === pokemonId);
  }

  toggleFavorite(pokemon: any): void {
  const headers = this.getAuthHeaders();

  if (this.isFavorite(pokemon.id)) {
    // Remover favorito pelo pokemon_id (alinhado ao backend novo)
    this.http.delete(`${this.apiUrl}/api/favorites/${pokemon.id}`, { headers }).subscribe({
      next: () => {
        console.log(`🗑️ Removido dos favoritos: ${pokemon.name}`);
        this.favorites = this.favorites.filter(f => f.pokemon_id !== pokemon.id);
      },
      error: (err) => console.error('❌ Erro ao remover favorito:', err)
    });
  } else {
    // Adicionar favorito com TODOS os dados que existem no list
    const payload = {
      pokemon_id: pokemon.id,
      pokemon_name: pokemon.name,
      pokemon_image: pokemon.sprite_url,
      height: pokemon.height,
      weight: pokemon.weight,
      abilities: pokemon.abilities, // array [{name,is_hidden}]
      stats: pokemon.stats,         // objeto { hp, attack, ... }
      types: pokemon.types          // array de strings
    };

    this.http.post(`${this.apiUrl}/api/favorites/`, payload, { headers }).subscribe({
      next: () => {
        console.log(`⭐ Adicionado aos favoritos: ${pokemon.name}`);
        // mantém o array em memória coerente com o backend
        this.favorites.push(payload);
      },
      error: (err) => console.error('❌ Erro ao adicionar favorito:', err)
    });
  }
}


  onPokeballClick(pokemon: any): void {
    console.log(`Pokébola clicada: ${pokemon.name}`);
  }

  // ==========================================================
  // ============ ⚙️ DETALHES E MODAL ========================
  // ==========================================================

  viewDetails(pokemonId: number): void {
    this.loadingDetails = true;
    this.showModal = true;
    this.selectedPokemon = null;

    this.http.get(`${this.apiUrl}/pokemon/search/${pokemonId}`).subscribe({
      next: (data: any) => {
        this.selectedPokemon = data;
        this.loadingDetails = false;
      },
      error: (err: any) => {
        this.loadingDetails = false;
        this.showModal = false;
        this.message = err.error?.msg || 'Erro ao carregar detalhes.';
        console.error(err);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPokemon = null;
  }

  // ==========================================================
  // ============ 🎨 FILTROS E ESTILOS ========================
  // ==========================================================

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

  getFilterStyle(isSelected: boolean): string {
    return isSelected
      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
      : 'bg-gray-200 hover:bg-gray-300 text-gray-700 shadow-sm';
  }

  getTypeColor(type: string, isSelected: boolean = false): string {
    const baseColors: { [key: string]: string } = {
      fire: 'bg-red-500 hover:bg-red-600', water: 'bg-blue-500 hover:bg-blue-600', grass: 'bg-green-500 hover:bg-green-600',
      bug: 'bg-lime-500 hover:bg-lime-600', normal: 'bg-gray-400 hover:bg-gray-500', poison: 'bg-purple-500 hover:bg-purple-600',
      electric: 'bg-yellow-500 hover:bg-yellow-600', ground: 'bg-yellow-800 hover:bg-yellow-900', fairy: 'bg-pink-300 hover:bg-pink-400',
      fighting: 'bg-red-800 hover:bg-red-900', psychic: 'bg-pink-600 hover:bg-pink-700', rock: 'bg-gray-600 hover:bg-gray-700',
      ghost: 'bg-indigo-900 hover:bg-indigo-950', ice: 'bg-cyan-300 hover:bg-cyan-400', dragon: 'bg-indigo-700 hover:bg-indigo-800',
      steel: 'bg-slate-500 hover:bg-slate-600', dark: 'bg-gray-800 hover:bg-gray-900', flying: 'bg-indigo-300 hover:bg-indigo-400',
    };
    const color = baseColors[type.toLowerCase()] || 'bg-gray-500 hover:bg-gray-600';
    return isSelected ? `text-white ${color} shadow-lg` : `text-white ${color} shadow-md opacity-80 hover:opacity-100`;
  }

  getStatWidth(statValue: unknown): number {
    const valueAsNumber = Number(statValue);
    if (isNaN(valueAsNumber)) return 0;
    const maxStatValue = 255;
    return (valueAsNumber / maxStatValue) * 100;
  }
}
