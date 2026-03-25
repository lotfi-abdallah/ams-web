import { Component, input, output } from '@angular/core';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-body',
  templateUrl: './post-body.html',
})
export class PostBody {
  post = input.required<PostModel>();
  tagClick = output<string>();

  onTagClick(tag: string) {
    this.tagClick.emit(tag);
  }
}
