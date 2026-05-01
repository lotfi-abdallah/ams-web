import { Component } from '@angular/core';
import { Timeline } from './timeline';
import { CreatePost } from './posts/create-post';
import { ConnectedUsers } from './components/connected-users/connected-users';

@Component({
  selector: 'app-home',
  imports: [Timeline, CreatePost, ConnectedUsers],
  templateUrl: './home.html',
})
export class Home {}
