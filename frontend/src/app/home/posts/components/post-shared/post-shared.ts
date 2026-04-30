import { Component, input } from '@angular/core';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-shared',
  templateUrl: './post-shared.html',
})
export class PostShared {
  sharedPost = input.required<PostModel | null | undefined>();
}
