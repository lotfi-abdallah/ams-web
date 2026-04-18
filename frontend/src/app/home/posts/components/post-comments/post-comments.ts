import { Component, input } from '@angular/core';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-comments',
  imports: [],
  templateUrl: './post-comments.html',
})
export class PostComments {
  post = input.required<PostModel>();
}
