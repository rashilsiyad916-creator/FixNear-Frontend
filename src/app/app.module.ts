
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './pages/home/home.component';
import { ProvidersComponent } from './pages/providers/providers.component';
import { ProviderDetailsComponent } from './pages/provider-details/provider-details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProviderPortalComponent } from './pages/provider-portal/provider-portal.component';
import { AdminApprovalsComponent } from './pages/admin-approvals/admin-approvals.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { ScrollTopComponent } from './shared/scroll-top/scroll-top.component';
import { NewsletterComponent } from './shared/newsletter/newsletter.component';
import { FancySelectComponent } from './shared/fancy-select/fancy-select.component';
import { SearchBarComponent } from './shared/search-bar/search-bar.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RevealDirective } from './directives/reveal.directive';
import { AuthInterceptor } from './services/auth.interceptor';
import { UnwrapInterceptor } from './services/unwrap.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProvidersComponent,
    ProviderDetailsComponent,
    LoginComponent,
    RegisterComponent,
    MyBookingsComponent,
    DashboardComponent,
    ProviderPortalComponent,
    AdminApprovalsComponent,
    NavbarComponent,
    FooterComponent,
    ToastComponent,
    ScrollTopComponent,
    NewsletterComponent,
    FancySelectComponent,
    SearchBarComponent,
    NotFoundComponent,
    RevealDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnwrapInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
