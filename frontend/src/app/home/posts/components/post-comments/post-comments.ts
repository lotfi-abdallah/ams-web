import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-comments',
  imports: [DatePipe],
  templateUrl: './post-comments.html',
})
export class PostComments {
  post = input.required<PostModel>();
}
