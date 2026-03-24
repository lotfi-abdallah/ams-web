import { Component } from '@angular/core';
import { CreatePost } from './posts/create-post';
import { PostsList } from './posts/posts-list';

@Component({
  selector: 'app-timeline',
  imports: [CreatePost, PostsList],
  templateUrl: './timeline.html',
})
export class Timeline {}
