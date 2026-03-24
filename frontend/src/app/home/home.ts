import { Component } from '@angular/core';
import { Timeline } from './timeline';
import { CreatePost } from './posts/create-post';

@Component({
  selector: 'app-home',
  imports: [Timeline, CreatePost],
  templateUrl: './home.html',
})
export class Home {}
