import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../services/game';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.html',
  styleUrls: ['./game-detail.scss'],
})
export class GameDetailComponent implements OnInit, OnDestroy {
  game: any = null;
  gameId: number = 0;
  lastMoveId: number = 0;
  private pollSubscription: Subscription | null = null;
  errorMessage: string | null = null;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.gameId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGame();
    this.startPolling();
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      console.log('Polling detenido en GameDetail');
    }
  }

  loadGame() {
    console.log(`🎮 Cargando juego ${this.gameId}...`);
    this.gameService.getGame(this.gameId).subscribe({
      next: (response) => {
        console.log('✅ Juego cargado:', response.game);
        this.game = response.game;

        // ✅ REDIRIGIR INMEDIATAMENTE SI EL JUEGO YA ESTÁ ACTIVO
        if (this.shouldRedirectToPlay()) {
          console.log('🚀 Juego activo detectado, redirigiendo a tablero...');
          this.redirectToPlay();
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar el juego:', err);
        this.errorMessage = 'Error al cargar el juego';
      },
    });
  }

  startPolling() {
    console.log(`🔄 Iniciando polling para juego ${this.gameId}...`);
    
    // ✅ POLLING MÁS FRECUENTE PARA DETECTAR CAMBIOS RÁPIDAMENTE
    this.pollSubscription = interval(1500).subscribe(() => {
      this.gameService.pollGame(this.gameId, this.lastMoveId).subscribe({
        next: (response) => {
          console.log('📡 Respuesta del polling en GameDetail:', response);

          // ✅ ACTUALIZAR DATOS SIEMPRE (no solo cuando hay cambios)
          if (response.game) {
            const previousStatus = this.game?.status;
            const previousPlayer2 = this.game?.player2;
            
            this.game = response.game;
            this.lastMoveId = response.last_move_id || this.lastMoveId;

            console.log('📊 Estado del juego actualizado:', {
              gameId: this.gameId,
              status: this.game.status,
              player1: this.game.player1?.fullName,
              player2: this.game.player2?.fullName,
              previousStatus,
              previousPlayer2: previousPlayer2?.fullName,
              shouldRedirect: this.shouldRedirectToPlay()
            });

            // ✅ DETECTAR CAMBIOS Y REDIRIGIR
            if (this.shouldRedirectToPlay()) {
              if (!previousPlayer2 && this.game.player2) {
                console.log('🎉 ¡Segundo jugador detectado!', {
                  player2: this.game.player2.fullName,
                  status: this.game.status
                });
              }
              
              if (previousStatus !== 'active' && this.game.status === 'active') {
                console.log('🎮 ¡Juego activado!', {
                  from: previousStatus,
                  to: this.game.status
                });
              }
              
              console.log('🚀 Redirigiendo al tablero de juego...');
              this.redirectToPlay();
            }
          }
        },
        error: (err) => {
          console.error('❌ Error en polling de GameDetail:', err);
          this.errorMessage = 'Error al actualizar el estado del juego';
        },
      });
    });
  }

  // ✅ FUNCIÓN MEJORADA PARA DETERMINAR SI DEBE REDIRIGIR
  private shouldRedirectToPlay(): boolean {
    if (!this.game) return false;
    
    const hasPlayer2 = this.game.player2 && this.game.player2.id;
    const isActive = this.game.status === 'active';
    const hasValidPlayers = this.game.player1 && this.game.player1.id;
    
    const shouldRedirect = hasValidPlayers && hasPlayer2 && isActive;
    
    console.log('🤔 ¿Debería redirigir?', {
      gameId: this.gameId,
      hasValidPlayers,
      hasPlayer2,
      isActive,
      player1: this.game.player1?.fullName,
      player2: this.game.player2?.fullName,
      status: this.game.status,
      shouldRedirect
    });
    
    return shouldRedirect;
  }

  // ✅ FUNCIÓN SEPARADA PARA REDIRIGIR
  private redirectToPlay(): void {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      console.log('🛑 Polling detenido antes de redirigir');
    }
    
    console.log(`🎯 Navegando a: /games/${this.gameId}/play`);
    this.router.navigate([`/games/${this.gameId}/play`]);
  }

  abandonGame() {
    console.log('❌ Abandonando juego...');
    
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
      console.log('🛑 Polling detenido al abandonar');
    }

    this.gameService.abandonGame(this.game.id).subscribe({
      next: () => {
        console.log('✅ Juego abandonado exitosamente');
        this.router.navigate(['/games']);
      },
      error: (err) => {
        console.error('❌ Error al abandonar:', err);
        this.errorMessage = 'Error al abandonar el juego';
        
        // ✅ REANUDAR POLLING SI FALLA EL ABANDONO
        this.startPolling();
      },
    });
  }
}
