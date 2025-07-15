import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class RegisterComponent {
  userData = { fullName: '', email: '', password: '' };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.userData).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => (this.errorMessage = err.error?.error || 'Error al registrarse'),
    });
  }

  gotToLogin() {
    this.router.navigate(['/login']);
  }
}
