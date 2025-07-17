// game-play.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GameService } from '../services/game';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-game-play',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-play.html',
  styleUrls: ['./game-play.scss'],
})
export class GamePlayComponent implements OnInit, OnDestroy {
  game: any = null;
  authUser: any = null;
  playerBoard: any = null;
  opponentBoard: any = null;
  playerMoves: any[] = [];
  opponentMoves: any[] = [];
  isPlayerTurn: boolean = false;
  errorMessage: string | null = null;
  lastMoveId: number = 0;
  private pollSubscription: Subscription | null = null;
  timeLeft: number = 30; // Temporizador de 30 segundos
  private timerSubscription: Subscription | null = null;

  constructor(
    private gameService: GameService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log(`cargando el juego para: ${id}`);
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        console.log('usuario aut:', response.user);
        this.authUser = response.user;
        this.loadGame(id);
        this.startPolling(id);
        this.startTimer();
      },
      error: (err) => {
        console.error('error al enkontrar al user:', err);
        this.errorMessage = 'Error al cargar el usuario';
      },
    });
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      console.log('se detuvo la sub pal polling');
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      console.log('se detuvo el temporizador');
    }
  }

  loadGame(id: number) {
    console.log(`obteniendo datos del juego para: ${id}`);
    this.gameService.getGame(id).subscribe({
      next: (response) => {
        console.log('datos del game:', response.game);
        this.game = response.game;
        this.updateBoardsAndMoves();
        this.checkPlayerTurn();
        this.resetTimer();
      },
      error: (err) => {
        console.error('elol pala encontlal el juego:', err);
        this.errorMessage = 'Error al cargar el juego';
      },
    });
  }

  startPolling(id: number) {
    console.log(`comenzando el poling para: ${id}, ultimomov: ${this.lastMoveId}`);
    this.pollSubscription = interval(2000).subscribe(() => {
      this.gameService.pollGame(id, this.lastMoveId).subscribe({
        next: (response) => {
          console.log('respuesta del polin:', response);
          if (response.status !== 'no_changes') {
            this.game = response.game;
            this.lastMoveId = response.last_move_id;
            this.updateBoardsAndMoves();
            this.checkPlayerTurn();
            this.resetTimer();
          }
        },
        error: (err) => {
          console.error('elol en el polin:', err);
          this.errorMessage = 'Error al actualizar el estado del juego';
        },
      });
    });
  }

  startTimer() {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.game.status === 'active' && this.isPlayerTurn) {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.timeLeft = 30; // Reiniciar el temporizador
          // El movimiento automático se maneja en el backend, pero aquí puedes actualizar el estado
          this.loadGame(this.game.id); // Recargar el juego para reflejar el movimiento automático
        }
      } else {
        this.timeLeft = 30; // Reiniciar si no es el turno del jugador
      }
    });
  }

  resetTimer() {
    this.timeLeft = 30;
  }

  updateBoardsAndMoves() {
    console.log('actu moves y tableros:', this.game);
    this.playerBoard = this.game.boards.find((b: any) => b.playerId === this.authUser.id);
    this.opponentBoard = this.game.boards.find((b: any) => b.playerId !== this.authUser.id);
    this.playerMoves = this.game.moves.filter((m: any) => m.playerId === this.authUser.id);
    this.opponentMoves = this.game.moves.filter((m: any) => m.playerId !== this.authUser.id);
    console.log('Player board:', this.playerBoard);
    console.log('Opponent board:', this.opponentBoard);
    console.log('Player moves:', this.playerMoves);
    console.log('Opponent moves:', this.opponentMoves);
  }

  checkPlayerTurn() {
    const lastMove = this.game.moves[this.game.moves.length - 1];
    this.isPlayerTurn = !lastMove
      ? this.game.player1.id === this.authUser.id
      : lastMove.playerId !== this.authUser.id;
    console.log('chekando el tulno mio:', {
      gameId: this.game.id,
      gameStatus: this.game.status,
      authUserId: this.authUser.id,
      player1Id: this.game.player1?.id,
      player2Id: this.game.player2?.id,
      lastMove: lastMove,
      isPlayerTurn: this.isPlayerTurn,
    });
    this.resetTimer();
  }

  makeMove(x: number, y: number) {
    console.log(`moviendo a (${x}, ${y})`, {
      gameId: this.game.id,
      gameStatus: this.game.status,
      isPlayerTurn: this.isPlayerTurn,
      authUserId: this.authUser.id,
    });
    if (this.game.status !== 'active') {
      this.errorMessage = 'El juego no está activo.';
      console.log('mobimiento blokeado: Juego no activo');
      return;
    }
    if (!this.isPlayerTurn) {
      this.errorMessage = 'No es tu turno.';
      console.log('mov blok: no es tu turno papi');
      return;
    }
    if (this.isMoveMade(y, x, this.playerMoves)) {
      this.errorMessage = 'Ya has disparado en esta posición.';
      console.log('mub blok, ya disparaste en esta posi xd');
      return;
    }
    if (x < 0 || x > 7 || y < 0 || y > 7) {
      this.errorMessage = 'Posición inválida.';
      console.log('mub bloc: coords no validas', { x, y });
      return;
    }
    this.gameService.makeMove(this.game.id, { x, y }).subscribe({
      next: (response) => {
        console.log('mub con exito:', {
          x,
          y,
          result: response.result,
          moveId: response.game.moves[response.game.moves.length - 1].id,
        });
        this.game = response.game;
        this.lastMoveId = response.game.moves[response.game.moves.length - 1].id;
        this.updateBoardsAndMoves();
        this.checkPlayerTurn();
        this.errorMessage = null;
        this.resetTimer();
      },
      error: (err) => {
        console.error('elol al movel:', err);
        this.errorMessage = err.error?.error || err.error?.details || 'Error al realizar el movimiento';
      },
    });
  }

  isHit(row: number, col: number, moves: any[]): boolean {
    const hit = moves.some((m) => m.y === row && m.x === col && m.result === 'hit');
    console.log(`chekin ssi el mov en (row: ${row}, col: ${col}) es hit:`, { hit, moves });
    return hit;
  }

  isMiss(row: number, col: number, moves: any[]): boolean {
    const miss = moves.some((m) => m.y === row && m.x === col && m.result === 'miss');
    console.log(`chekin ssi el mov en (row: ${row}, col: ${col}) es miss:`, { miss, moves });
    return miss;
  }

  isMoveMade(row: number, col: number, moves: any[]): boolean {
    const made = moves.some((m) => m.y === row && m.x === col);
    console.log(`chekin ssi el mov en (row: ${row}, col: ${col}) es made:`, { made, moves });
    return made;
  }

  abandonGame() {
  if (!confirm('¿Estás segura/o de que deseas abandonar la partida? Esto contará como derrota.')) return;

  this.gameService.abandonGame(this.game.id).subscribe({
    next: (response) => {
      console.log('Partida abandonada:', response);
      this.game = response.game;
      this.errorMessage = null;
    },
    error: (err) => {
      console.error('Error al abandonar la partida:', err);
      this.errorMessage = err.error?.error || 'No se pudo abandonar la partida';
    }
  });
}

}
