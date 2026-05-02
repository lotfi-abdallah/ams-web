import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Post as PostModel } from '../../../../../models';
import { PostInteractionFacade } from '../../state/post-interaction.facade';
import { AuthService } from '../../../../../services/auth.service';
import { LucideDynamicIcon, LucideTrash, LucidePencil, LucideX, LucideCheck } from '@lucide/angular';

@Component({
  selector: 'app-post-comments',
  imports: [FormsModule, LucideDynamicIcon],
  templateUrl: './post-comments.html',
})
export class PostComments {
  post = input.required<PostModel>();
  postUpdated = output<PostModel>();

  readonly trashIcon = LucideTrash;
  readonly editIcon = LucidePencil;
  readonly cancelIcon = LucideX;
  readonly confirmIcon = LucideCheck;

  commentText = '';
  isSubmitting = false;

  editingIndex: number | null = null;
  editText = '';
  isEditSubmitting = false;

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

  canEdit(commentedBy: number): boolean {
    const userId = this.facade.getCurrentUserIdValue();
    return userId !== null && userId === commentedBy;
  }

  startEdit(index: number, currentText: string): void {
    this.editingIndex = index;
    this.editText = currentText;
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editText = '';
  }

  submitEdit(index: number): void {
    if (!this.editText.trim() || this.isEditSubmitting) return;
    this.isEditSubmitting = true;
    this.facade.updateComment(this.post(), index, this.editText).subscribe({
      next: () => {
        this.editingIndex = null;
        this.editText = '';
        this.isEditSubmitting = false;
        this.postUpdated.emit({ ...this.post() });
      },
      error: () => {
        this.isEditSubmitting = false;
      },
    });
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

  deleteComment(commentIndex: number): void {
    this.facade.deleteComment(this.post(), commentIndex).subscribe({
      next: () => this.postUpdated.emit({ ...this.post() }),
    });
  }
}
