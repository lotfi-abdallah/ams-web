import { Component } from '@angular/core';
import { Post } from './post';

@Component({
  selector: 'app-posts-list',
  imports: [Post],
  templateUrl: './posts-list.html',
})
export class PostsList {}
