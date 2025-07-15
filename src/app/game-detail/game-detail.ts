import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../services/game';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-detail.html',
  styleUrls: ['./game-detail.scss'],
})
export class GameDetailComponent implements OnInit {
  game: any = null;

  constructor(
    private gameService: GameService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.gameService.getGame(id).subscribe({
      next: (response) => (this.game = response.game),
      error: (err) => console.error(err),
    });
  }

  abandonGame() {
    this.gameService.abandonGame(this.game.id).subscribe({
      next: () => this.router.navigate(['/games']),
      error: (err) => console.error(err),
    });
  }
}
