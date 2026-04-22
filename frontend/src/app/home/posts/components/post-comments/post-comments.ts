import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Post as PostModel } from '../../../../../models';
import { PostInteractionFacade } from '../../state/post-interaction.facade';
import { AuthService } from '../../../../../services/auth.service';
import { LucideDynamicIcon, LucideTrash } from '@lucide/angular';

@Component({
  selector: 'app-post-comments',
  imports: [FormsModule, LucideDynamicIcon],
  templateUrl: './post-comments.html',
})
export class PostComments {
  post = input.required<PostModel>();
  postUpdated = output<PostModel>();

  readonly trashIcon = LucideTrash;

  commentText = '';
  isSubmitting = false;

  constructor(
    private facade: PostInteractionFacade,
    private auth: AuthService,
  ) {}

  isLoggedIn(): boolean {
    return !!this.auth.user();
  }

  canDelete(commentedBy: number): boolean {
    const userId = this.facade.getCurrentUserIdValue();
    return userId !== null && (userId === commentedBy || userId === this.post().createdBy);
  }

  submitComment(): void {
    if (!this.commentText.trim() || this.isSubmitting) return;
    this.isSubmitting = true;
    this.facade.addComment(this.post(), this.commentText).subscribe({
      next: () => {
        this.commentText = '';
        this.isSubmitting = false;
        this.postUpdated.emit({ ...this.post() });
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  deleteComment(commentId: string): void {
    this.facade.deleteComment(this.post(), commentId).subscribe({
      next: () => this.postUpdated.emit({ ...this.post() }),
    });
  }
}
