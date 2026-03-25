import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideDynamicIcon, LucideTrash2 } from '@lucide/angular';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-comments',
  imports: [DatePipe, LucideDynamicIcon],
  templateUrl: './post-comments.html',
})
export class PostComments {
  post = input.required<PostModel>();
  currentUserName = input<string | null>(null);
  commentDraft = input.required<string>();
  isCommentSubmitting = input.required<boolean>();
  deletingCommentIds = input.required<string[]>();

  commentDraftChange = output<string>();
  submitComment = output<void>();
  deleteComment = output<string>();

  readonly trashIcon = LucideTrash2;

  onCommentDraftChange(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    this.commentDraftChange.emit(target?.value ?? '');
  }

  onSubmitComment() {
    this.submitComment.emit();
  }

  onCommentKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.onSubmitComment();
    }
  }

  onDeleteComment(commentId: string) {
    this.deleteComment.emit(commentId);
  }

  canDeleteComment(commentAuthor: string): boolean {
    const userName = this.currentUserName();
    return !!userName && userName === commentAuthor;
  }

  isCommentDeleting(commentId: string): boolean {
    return this.deletingCommentIds().includes(commentId);
  }
}
