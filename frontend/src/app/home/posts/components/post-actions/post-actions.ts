import { Component, input, output } from '@angular/core';
import { LucideDynamicIcon, LucideHeart, LucideMessageCircle } from '@lucide/angular';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-actions',
  imports: [LucideDynamicIcon],
  templateUrl: './post-actions.html',
})
export class PostActions {
  post = input.required<PostModel>();
  isLikeLoading = input.required<boolean>();
  isLikedByCurrentUser = input.required<boolean>();
  toggleLike = output<void>();

  readonly heartIcon = LucideHeart;
  readonly commentIcon = LucideMessageCircle;

  onToggleLike() {
    this.toggleLike.emit();
  }
}
