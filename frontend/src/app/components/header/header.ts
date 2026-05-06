import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { ConnectedUsersService } from '../../../services/connected-users.service';
import { ConnectedUsers } from '../../home/components/connected-users/connected-users';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [ConnectedUsers],
  templateUrl: './header.html',
})
export class Header {
  showConnectedUsers = false;

  constructor(
    public auth: AuthService,
    private socket: SocketService,
    public connectedUsers: ConnectedUsersService,
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
