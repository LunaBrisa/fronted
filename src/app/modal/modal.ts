import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GameService, GamesResponse, Game } from '../services/game';
import { GameDetailsComponent } from '../game-details/game-details';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, GameDetailsComponent],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
  animations: [
    trigger('animationState', [
      state('*', style({})),
      transition('* => *', animate(0))
    ]),
    trigger('.disabled', [
      state('*', style({})),
      transition('* => *', animate(0))
    ])
  ]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  public barChartData = [
    { name: 'Partidas Jugadas', value: 0 },
    { name: 'Partidas Ganadas', value: 0 },
    { name: 'Partidas Perdidas', value: 0 }
  ];

  public colorScheme = 'vivid';
  public errorMessage: string | null = null;
  public games: Game[] = [];
  public filteredGames: Game[] = [];
  public showTable: boolean = false;
  public showDetails: boolean = false;
  public selectedGame: Game | null = null;
  protected userId: number | null = null;

  constructor(private gameService: GameService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.errorMessage = null;
    this.gameService.getStats().subscribe({
      next: (response: GamesResponse) => {
        console.log('API Response:', response);
        this.games = response.games || [];
        this.userId = response.auth?.user?.id;
        console.log('User ID:', this.userId, 'Games:', this.games);
        if (!this.userId) {
          this.errorMessage = 'No se pudo obtener el ID del usuario';
          this.cdr.detectChanges();
          return;
        }
        if (!this.games.length) {
          this.errorMessage = 'No se encontraron partidas finalizadas';
          this.cdr.detectChanges();
          return;
        }
        const totalGames = this.games.length;
        const gamesWon = this.games.filter(game => game.winner === this.userId).length;
        const gamesLost = totalGames - gamesWon;

        this.barChartData = [
          { name: 'Partidas Jugadas', value: totalGames },
          { name: 'Partidas Ganadas', value: gamesWon },
          { name: 'Partidas Perdidas', value: gamesLost }
        ];
        console.log('Updated barChartData:', this.barChartData);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching stats:', err);
        this.errorMessage = `Error al cargar las estadísticas: ${err.statusText || 'Error desconocido'}`;
        this.cdr.detectChanges();
      }
    });
  }

  onSelect(event: any) {
    console.log('Bar clicked:', event);
    const category = event.name;
    this.showTable = true;
    this.showDetails = false;
    this.selectedGame = null;
    if (category === 'Partidas Jugadas') {
      this.filteredGames = this.games;
    } else if (category === 'Partidas Ganadas') {
      this.filteredGames = this.games.filter(game => game.winner === this.userId);
    } else if (category === 'Partidas Perdidas') {
      this.filteredGames = this.games.filter(game => game.winner !== this.userId);
    }
    console.log('Filtered games:', this.filteredGames);
    this.cdr.detectChanges();
  }

  getOpponentName(game: Game): string {
    return this.userId === game.player1.id ? game.player2?.fullName || 'Unknown' : game.player1.fullName;
  }

  getResult(game: Game): string {
    return game.winner === this.userId ? 'Ganada' : 'Perdida';
  }

  viewGameDetails(game: Game) {
    console.log('Opening game details for game ID:', game.id);
    this.selectedGame = game;
    this.showDetails = true;
    this.cdr.detectChanges();
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedGame = null;
    this.cdr.detectChanges();
  }

  formatAxis(value: number): string {
    return value.toFixed(0);
  }

  closeModal() {
    this.showTable = false;
    this.showDetails = false;
    this.filteredGames = [];
    this.selectedGame = null;
    this.close.emit();
  }
}
