import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthService } from '../services/auth.service';
import { NotificationListenerService } from '../services/notification-listener.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  constructor(
    private auth: AuthService,
    private notifListener: NotificationListenerService,
  ) {}

  ngOnInit(): void {
    this.notifListener.start();
    this.auth.bootstrap();
  }
}
