import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar], // só componentes standalone ou necessários
  templateUrl: './app.html',
  styleUrls: ['./app.css']        // corrigi para styleUrls
})
export class App {
  protected readonly title = signal('pokeapi');
}
