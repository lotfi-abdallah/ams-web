import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Post as PostModel } from '../../../models';
import { finalize } from 'rxjs';
import { PostInteractionFacade } from './state/post-interaction.facade';
import { PostHeader } from './components/post-header/post-header';
import { PostBody } from './components/post-body/post-body';
import { PostActions } from './components/post-actions/post-actions';
import { PostComments } from './components/post-comments/post-comments';
import { PostShared } from './components/post-shared/post-shared';
import { NotificationService } from '../../../services/notification.service';
import { PostsService } from '../../../services/posts.service';

@Component({
  selector: 'app-post',
  imports: [FormsModule, PostHeader, PostBody, PostActions, PostComments, PostShared],
  templateUrl: './post.html',
})
export class PostCard {
  postInput = input.required<PostModel>({ alias: 'post' });
  localPost = signal<PostModel | null>(null);
  isWrapped = signal(false);
  isLikeLoading = signal(false);
  isCommentsOpen = signal(false);
  showShareForm = signal(false);
  shareError = signal('');
  isShareSubmitting = signal(false);
  shareText = '';

  post(): PostModel {
    return this.localPost() ?? this.postInput();
  }

  onPostUpdated(updated: PostModel): void {
    this.localPost.set(updated);
  }

  constructor(
    private postInteraction: PostInteractionFacade,
    private notification: NotificationService,
    private postsService: PostsService,
  ) {}

  toggleWrap() {
    this.isWrapped.update((value) => !value);
  }

  toggleComments() {
    this.isCommentsOpen.update((value) => !value);
  }

  toggleShareForm() {
    this.showShareForm.update((value) => {
      const nextValue = !value;
      if (!nextValue) {
        this.resetShareForm();
      } else {
        this.shareError.set('');
      }
      return nextValue;
    });
  }

  cancelShare() {
    this.showShareForm.set(false);
    this.resetShareForm();
  }

  submitShare() {
    if (this.isShareSubmitting()) {
      return;
    }

    const trimmedBody = this.shareText.trim();
    if (trimmedBody.length < 3) {
      this.shareError.set('Le message doit contenir au moins 3 caracteres.');
      return;
    }

    if (this.postInteraction.getCurrentUserIdValue() === null) {
      const message = 'Veuillez vous connecter pour partager une publication.';
      this.shareError.set(message);
      this.notification.error(message);
      return;
    }

    this.isShareSubmitting.set(true);
    this.shareError.set('');

    this.postInteraction
      .sharePost(this.post()._id, trimmedBody)
      .pipe(finalize(() => this.isShareSubmitting.set(false)))
      .subscribe({
        next: (newPost) => {
          this.showShareForm.set(false);
          this.resetShareForm();

          if (newPost) {
            this.postsService.prependPostToTimeline(newPost);
          }
        },
        error: (error) => {
          const message = error?.error?.message ?? 'Impossible de partager cette publication.';
          this.shareError.set(message);
        },
      });
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

  private resetShareForm() {
    this.shareText = '';
    this.shareError.set('');
    this.isShareSubmitting.set(false);
  }
}
