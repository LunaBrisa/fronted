import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { AuthService } from '../services/auth';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit {
  user: any = null;
  showModal = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (response) => (this.user = response.user),
      error: () => this.router.navigate(['/login']),
    });
  }

  closeModal() {
    this.showModal = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
    });
  }

  stats() {
    this.showModal = true;
  }
}
