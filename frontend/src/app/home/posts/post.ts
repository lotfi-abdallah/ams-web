import { Component, input, signal } from '@angular/core';
import { Post as PostModel } from '../../../models';
import { finalize } from 'rxjs';
import { PostInteractionFacade } from './state/post-interaction.facade';
import { PostHeader } from './components/post-header/post-header';
import { PostBody } from './components/post-body/post-body';
import { PostActions } from './components/post-actions/post-actions';
import { PostComments } from './components/post-comments/post-comments';
import { PostShared } from './components/post-shared/post-shared';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-post',
  imports: [PostHeader, PostBody, PostActions, PostComments, PostShared],
  templateUrl: './post.html',
})
export class PostCard {
  postInput = input.required<PostModel>({ alias: 'post' });
  localPost = signal<PostModel | null>(null);
  isWrapped = signal(false);
  isLikeLoading = signal(false);
  isCommentsOpen = signal(false);

  post(): PostModel {
    return this.localPost() ?? this.postInput();
  }

  onPostUpdated(updated: PostModel): void {
    this.localPost.set(updated);
  }

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
}
