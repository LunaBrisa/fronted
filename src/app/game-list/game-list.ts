import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { GameService } from '../services/game';

@Component({
  selector: 'app-game-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-list.html',
  styleUrls: ['./game-list.scss'],
})
export class GameListComponent implements OnInit {
  games: any[] = [];
  authUser: any = null;
  errorMessage: string | null = null;

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit() {
    this.loadGames();
  }

  loadGames() {
    console.log('Loading games...');
    this.gameService.getGames().subscribe({
      next: (response) => {
        console.log('Games loaded:', response);
        this.games = response.games;
        this.authUser = response.auth.user;
      },
      error: (err) => {
        console.error('Error loading games:', err);
        this.errorMessage = 'Error al cargar los juegos';
      },
    });
  }

  createGame() {
    console.log('Creating new game...');
    this.gameService.createGame().subscribe({
      next: (response) => {
        console.log('Game created successfully:', response);
        const gameId = response.game.id;
        this.loadGames();
        this.router.navigate([`/games/${gameId}`]);
      },
      error: (err) => {
        console.error('Error creating game:', err);
        this.errorMessage = err.error?.error || 'Error al crear el juego';
      },
    });
  }

  joinGame(id: number) {
    console.log(`Joining game with ID: ${id}`);
    this.gameService.joinGame(id).subscribe({
      next: (response) => {
        console.log('Joined game successfully:', response);
        const gameId = response.game.id;
        this.loadGames();
        this.router.navigate([`/games/${gameId}/play`]);
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error joining game:', err);
        this.errorMessage = err.error?.error || 'Error al unirse al juego';
      },
    });
  }

  cancelGame(id: number) {
    console.log(`Cancelling game with ID: ${id}`);
    this.gameService.cancelGame(id).subscribe({
      next: (response) => {
        console.log('Game cancelled:', response);
        this.loadGames();
        this.errorMessage = null;
      },
      error: (err) => {
        console.error('Error cancelling game:', err);
        this.errorMessage = err.error?.error || 'Error al cancelar el juego';
      },
    });
  }
}
