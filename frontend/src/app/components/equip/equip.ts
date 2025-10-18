import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-equip',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equip.html',
  styleUrls: ['./equip.css']
})
export class Equip implements OnInit {
  apiUrl = 'http://localhost:5000';
  equipe: any[] = [];
  loading = false;
  selectedPokemon: any = null;
  showModal = false;
  message = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadEquipe();
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
  // ⚙️ CARREGAR EQUIPE
  // ==========================================================
  loadEquipe(): void {
    this.loading = true;
    const headers = this.getAuthHeaders();

    this.http.get<any[]>(`${this.apiUrl}/api/equipe/`, { headers }).subscribe({
      next: (data) => {
        console.log('✅ Equipe carregada:', data);
        this.equipe = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Erro ao carregar equipe:', err);
        this.loading = false;
      }
    });
  }

  // ==========================================================
  // 🗑️ REMOVER POKÉMON DA EQUIPE
  // ==========================================================
  removeFromTeam(pokemonId: number): void {
    const headers = this.getAuthHeaders();
    const id = pokemonId || 0;

    if (!id) {
      console.warn('⚠️ ID do Pokémon inválido para remoção.');
      return;
    }

    this.http.delete(`${this.apiUrl}/api/equipe/${id}`, { headers }).subscribe({
      next: () => {
        console.log('🗑️ Pokémon removido da equipe:', id);
        this.equipe = this.equipe.filter(p => p.pokemon_id !== id && p.id !== id);
        this.equipe = [...this.equipe]; // força re-renderização
        this.message = 'Pokémon removido da equipe!';
      },
      error: (err) => {
        console.error('❌ Erro ao remover Pokémon:', err);
        this.message = 'Erro ao remover Pokémon da equipe.';
      }
    });
  }

  // ==========================================================
  // 🔍 MODAL DE DETALHES
  // ==========================================================
  viewDetails(pokemon: any): void {
    this.selectedPokemon = pokemon;
    this.showModal = true;
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
}
