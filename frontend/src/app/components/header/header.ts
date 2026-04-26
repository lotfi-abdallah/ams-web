import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
})
export class Header {
  constructor(
    public auth: AuthService,
    private socket: SocketService,
    private router: Router,
  ) {}

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.socket.disconnect();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      },
    });
  }
}
