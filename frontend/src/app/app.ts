import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.fetchCurrentUser();
  }
}
