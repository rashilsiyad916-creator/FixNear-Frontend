import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;
  scrolled = false;

  constructor(public authService: AuthService) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 8;
  }

  logout(): void {
    this.authService.logout();
    this.menuOpen = false;
  }
}
