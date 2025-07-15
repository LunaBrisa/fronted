import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { GameListComponent } from './game-list/game-list';
import { GameDetailComponent } from './game-detail/game-detail';
import { GamePlayComponent } from './game-play/game-play';
import { AuthGuard } from './guards/auth-guard';
import { authInterceptor } from './services/auth-interceptor';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'games', component: GameListComponent, canActivate: [AuthGuard] },
      { path: 'games/:id', component: GameDetailComponent, canActivate: [AuthGuard] },
      { path: 'games/:id/play', component: GamePlayComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
      { path: '**', redirectTo: '/dashboard' },
    ]),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
  ]
};
