import { Component, input, signal } from '@angular/core';
import { Post as PostModel } from '../../../models';
import { finalize } from 'rxjs';
import { PostInteractionFacade } from './state/post-interaction.facade';
import { PostHeader } from './components/post-header/post-header';
import { PostBody } from './components/post-body/post-body';
import { PostActions } from './components/post-actions/post-actions';
import { PostComments } from './components/post-comments/post-comments';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-post',
  imports: [PostHeader, PostBody, PostActions, PostComments],
  templateUrl: './post.html',
})
export class PostCard {
  post = input.required<PostModel>();
  isWrapped = signal(false);
  isLikeLoading = signal(false);
  isCommentsOpen = signal(false);
  commentDraft = signal('');
  isCommentSubmitting = signal(false);
  deletingCommentIds = signal<string[]>([]);

  constructor(
    private postInteraction: PostInteractionFacade,
    private notification: NotificationService,
  ) {}

  toggleWrap() {
    this.isWrapped.update((value) => !value);
  }

  toggleComments() {
    this.isCommentsOpen.update((value) => !value);
  }

  updateCommentDraft(value: string) {
    this.commentDraft.set(value);
  }

  currentUserName() {
    return this.postInteraction.getCurrentUserNameValue();
  }

  isLikedByCurrentUser() {
    return this.postInteraction.isLikedByCurrentUser(this.post());
  }

  toggleLike() {
    if (this.isLikeLoading()) {
      return;
    }
    this.isLikeLoading.set(true);

    this.postInteraction
      .toggleLike(this.post())
      .pipe(finalize(() => this.isLikeLoading.set(false)))
      .subscribe({
        error: () => {
          this.isLikeLoading.set(false);
          // error message
          this.notification.error("Impossible de mettre a jour le j'aime.");
        },
      });
  }

  submitComment() {
    const commentText = this.commentDraft().trim();
    if (!commentText || this.isCommentSubmitting()) {
      return;
    }

    this.isCommentSubmitting.set(true);

    this.postInteraction
      .addComment(this.post(), commentText)
      .pipe(finalize(() => this.isCommentSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.commentDraft.set('');
          this.isCommentsOpen.set(true);
        },
        error: () => {},
      });
  }

  deleteComment(commentId: string) {
    if (!commentId || this.deletingCommentIds().includes(commentId)) {
      return;
    }

    this.deletingCommentIds.update((ids) => [...ids, commentId]);

    this.postInteraction
      .deleteComment(this.post(), commentId)
      .pipe(
        finalize(() => {
          this.deletingCommentIds.update((ids) => ids.filter((id) => id !== commentId));
        }),
      )
      .subscribe({
        error: () => {},
      });
  }
}
