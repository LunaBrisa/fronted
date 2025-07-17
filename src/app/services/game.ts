import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface User {
  id: number;
  fullName: string;
  email: string;
}

interface Board {
  id: number;
  gameId: number;
  playerId: number;
  grid: number[][];
}

interface Move {
  id: number;
  gameId: number;
  playerId: number;
  x: number;
  y: number;
  result: 'hit' | 'miss';
  createdAt: string;
}

export interface Game {
  id: number;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  winner: number | null;
  player1: User;
  player2: User | null;
  boards: Board[];
  moves: Move[];
  player_1_inactive_misses: number;
  player_2_inactive_misses: number;
}

interface GameResponse {
  game: Game;
}

export interface GamesResponse {
  games: Game[];
  auth: { user: User };
}

interface MoveResponse {
  message: string;
  result: 'hit' | 'miss';
  game: Game;
}

interface PollResponse {
  game: Game;
  last_move_id: number;
  auth: { user: User };
  status?: 'no_changes';
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private apiUrl = 'http://localhost:3333/api';

  constructor(private http: HttpClient) {}

  getGames(): Observable<GamesResponse> {
    return this.http.get<GamesResponse>(`${this.apiUrl}/games`);
  }

  createGame(): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/games`, {});
  }

  getGame(id: number): Observable<GameResponse> {
    return this.http.get<GameResponse>(`${this.apiUrl}/games/${id}`);
  }

  joinGame(id: number): Observable<GameResponse> {
    return this.http.post<GameResponse>(`${this.apiUrl}/games/${id}/join`, {});
  }

  cancelGame(id: number): Observable<{ message: string; game: Game }> {
    return this.http.post<{ message: string; game: Game }>(`${this.apiUrl}/games/${id}/cancel`, {});
  }

  abandonGame(id: number): Observable<{ message: string; game: Game }> {
    return this.http.post<{ message: string; game: Game }>(`${this.apiUrl}/games/${id}/abandon`, {});
  }

  makeMove(gameId: number, move: { x: number; y: number }): Observable<MoveResponse> {
    return this.http.post<MoveResponse>(`${this.apiUrl}/games/${gameId}/moves`, move);
  }

  pollGame(gameId: number, lastMoveId: number): Observable<PollResponse> {
    return this.http.get<PollResponse>(`${this.apiUrl}/games/${gameId}/poll?last_move_id=${lastMoveId}`);
  }

  getStats(): Observable<GamesResponse> {
    return this.http.get<GamesResponse>(`${this.apiUrl}/games/stats`);
  }
}
