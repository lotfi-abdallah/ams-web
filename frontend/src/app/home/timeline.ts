import { Component } from '@angular/core';
import { PostsList } from './posts/posts-list';

@Component({
  selector: 'app-timeline',
  imports: [PostsList],
  templateUrl: './timeline.html',
})
export class Timeline {}
