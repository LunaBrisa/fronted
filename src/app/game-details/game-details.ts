import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../services/game';

@Component({
  selector: 'app-game-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-details.html',
  styleUrls: ['./game-details.scss']
})
export class GameDetailsComponent {
  @Input() game: Game | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Input() userId: number | null = null;

  playerBoard: any = null;
  opponentBoard: any = null;
  playerMoves: any[] = [];
  opponentMoves: any[] = [];

  ngOnChanges() {
    if (this.game && this.userId) {
      this.playerBoard = this.game.boards.find((b: any) => b.playerId === this.userId);
      this.opponentBoard = this.game.boards.find((b: any) => b.playerId !== this.userId);
      this.playerMoves = this.game.moves.filter((m: any) => m.playerId === this.userId);
      this.opponentMoves = this.game.moves.filter((m: any) => m.playerId !== this.userId);
      console.log('Game details loaded:', {
        gameId: this.game.id,
        playerBoard: this.playerBoard,
        opponentBoard: this.opponentBoard,
        playerMoves: this.playerMoves,
        opponentMoves: this.opponentMoves
      });
    }
  }

  isHit(row: number, col: number, moves: any[]): boolean {
    return moves.some((m) => m.y === row && m.x === col && m.result === 'hit');
  }

  isMiss(row: number, col: number, moves: any[]): boolean {
    return moves.some((m) => m.y === row && m.x === col && m.result === 'miss');
  }

  getPlayerName(playerId: number): string {
    if (!this.game) return 'Unknown';
    return playerId === this.game.player1.id ? this.game.player1.fullName : this.game.player2?.fullName || 'Unknown';
  }

  closeModal() {
    this.close.emit();
  }
}
