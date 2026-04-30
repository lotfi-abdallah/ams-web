import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import {
  PostNotificationPayload,
  UserConnectedPayload,
  UserDisconnectedPayload,
} from './socket-events';

@Injectable({ providedIn: 'root' })
export class NotificationListenerService {
  constructor(
    private socket: SocketService,
    private notification: NotificationService,
    private auth: AuthService,
  ) {}

  start(): void {
    this.socket.on<UserConnectedPayload>('user:connected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.success(
        `${data.prenom} ${data.nom} vient de se connecter.`,
      );
    });

    this.socket.on<UserDisconnectedPayload>('user:disconnected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.error(`${data.pseudo} vient de se déconnecter.`);
    });

    this.socket.on<PostNotificationPayload>('post:liked', (data) => {
      this.notification.success(`${data.by.pseudo} a aimé votre post.`);
    });

    this.socket.on<PostNotificationPayload>('post:commented', (data) => {
      this.notification.success(`${data.by.pseudo} a commenté votre post.`);
    });
  }
}
