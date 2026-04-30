import { Component, input, output } from '@angular/core';
import {
  LucideDynamicIcon,
  LucideHeart,
  LucideMessageCircle,
  LucidePencil,
  LucideShare2,
  LucideTrash,
} from '@lucide/angular';
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
  isCommentsOpen = input.required<boolean>();
  canManage = input.required<boolean>();
  isEditing = input.required<boolean>();
  isDeleteSubmitting = input.required<boolean>();
  toggleLike = output<void>();
  toggleComments = output<void>();
  shareClicked = output<void>();
  editClicked = output<void>();
  deleteClicked = output<void>();

  readonly heartIcon = LucideHeart;
  readonly commentIcon = LucideMessageCircle;
  readonly shareIcon = LucideShare2;
  readonly editIcon = LucidePencil;
  readonly deleteIcon = LucideTrash;

  onToggleLike() {
    this.toggleLike.emit();
  }

  onToggleComments() {
    this.toggleComments.emit();
  }

  onShareClicked() {
    this.shareClicked.emit();
  }

  onEditClicked() {
    this.editClicked.emit();
  }

  onDeleteClicked() {
    this.deleteClicked.emit();
  }
}
