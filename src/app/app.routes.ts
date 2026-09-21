import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';

export const routes: Routes = [
  { path: 'auth', component: AuthPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' }
];
