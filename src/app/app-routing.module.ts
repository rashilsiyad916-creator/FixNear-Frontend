
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ProvidersComponent } from './pages/providers/providers.component';
import {
  ProviderDetailsComponent
} from './pages/provider-details/provider-details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProviderPortalComponent } from './pages/provider-portal/provider-portal.component';
import { AdminApprovalsComponent } from './pages/admin-approvals/admin-approvals.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { ProviderGuard } from './guards/provider.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'providers', component: ProvidersComponent },
  { path: 'providers/:id', component: ProviderDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'provider', component: ProviderPortalComponent, canActivate: [ProviderGuard] },
  { path: 'admin', component: AdminApprovalsComponent, canActivate: [AdminGuard] },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
