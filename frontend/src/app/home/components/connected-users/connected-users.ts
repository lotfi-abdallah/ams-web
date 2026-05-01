import { Component } from '@angular/core';
import { ConnectedUsersService } from '../../../../services/connected-users.service';
import { User } from '../../../../models';

type ConnectedUser = Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom' | 'avatar'>;

@Component({
  selector: 'app-connected-users',
  templateUrl: './connected-users.html',
})
export class ConnectedUsers {
  readonly users: ConnectedUsersService['users'];

  constructor(private connectedUsers: ConnectedUsersService) {
    this.users = this.connectedUsers.users;
  }

  displayName(user: ConnectedUser): string {
    const pseudo = user.pseudo?.trim();
    if (pseudo) return pseudo;

    const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
    return fullName || `User #${user.id}`;
  }

  secondaryName(user: ConnectedUser): string {
    const fullName = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
    return fullName || `#${user.id}`;
  }

  initial(user: ConnectedUser): string {
    const base = user.pseudo?.trim() || user.prenom?.trim() || user.nom?.trim() || String(user.id);
    return base ? base.charAt(0).toUpperCase() : '?';
  }
}
