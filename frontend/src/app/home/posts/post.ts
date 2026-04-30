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
import { PostEditForm } from './components/post-edit/post-edit';
import { PostShareForm } from './components/post-share/post-share';
import { NotificationService } from '../../../services/notification.service';
import { PostsService } from '../../../services/posts.service';

@Component({
  selector: 'app-post',
  imports: [
    FormsModule,
    PostHeader,
    PostBody,
    PostActions,
    PostComments,
    PostShared,
    PostEditForm,
    PostShareForm,
  ],
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
  isEditing = signal(false);
  editError = signal('');
  isEditSubmitting = signal(false);
  editBody = '';
  editImageUrl = '';
  editImageTitle = '';
  editHashtags = '';
  isDeleteSubmitting = signal(false);

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

  canManagePost(): boolean {
    const userId = this.postInteraction.getCurrentUserIdValue();
    return userId !== null && userId === this.post().createdBy;
  }

  startEdit() {
    if (!this.canManagePost()) {
      return;
    }

    this.showShareForm.set(false);
    this.resetShareForm();
    this.isEditing.set(true);
    this.editError.set('');

    const currentPost = this.post();
    this.editBody = currentPost.body ?? '';
    this.editImageUrl = currentPost.images?.url ?? '';
    this.editImageTitle = currentPost.images?.title ?? '';
    this.editHashtags = (currentPost.hashtags ?? []).join(', ');
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.resetEditForm();
  }

  submitEdit() {
    if (this.isEditSubmitting()) {
      return;
    }

    if (!this.canManagePost()) {
      const message = "Vous n'etes pas autorise a modifier ce post.";
      this.editError.set(message);
      this.notification.error(message);
      return;
    }

    const trimmedBody = this.editBody.trim();
    if (!trimmedBody) {
      this.editError.set('Le contenu du post est obligatoire.');
      return;
    }

    if (trimmedBody.length > 300) {
      this.editError.set('Le contenu du post ne peut pas depasser 300 caracteres.');
      return;
    }

    const trimmedImageUrl = this.editImageUrl.trim();
    const trimmedImageTitle = this.editImageTitle.trim();
    if ((trimmedImageUrl && !trimmedImageTitle) || (!trimmedImageUrl && trimmedImageTitle)) {
      this.editError.set("Renseignez l'URL et le titre de l'image ensemble.");
      return;
    }

    const normalizedHashtags = this.editHashtags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const uniqueHashtags = [...new Set(normalizedHashtags)];

    this.isEditSubmitting.set(true);
    this.editError.set('');

    this.postInteraction
      .updatePost(this.post(), {
        body: trimmedBody,
        imageUrl: trimmedImageUrl || undefined,
        imageTitle: trimmedImageTitle || undefined,
        hashtags: uniqueHashtags,
      })
      .pipe(finalize(() => this.isEditSubmitting.set(false)))
      .subscribe({
        next: (updatedPost) => {
          this.onPostUpdated(updatedPost);
          this.isEditing.set(false);
          this.resetEditForm();
        },
        error: (error) => {
          const message = error?.error?.message ?? 'Impossible de modifier cette publication.';
          this.editError.set(message);
        },
      });
  }

  confirmDelete() {
    if (this.isDeleteSubmitting()) {
      return;
    }

    if (!this.canManagePost()) {
      const message = "Vous n'etes pas autorise a supprimer ce post.";
      this.notification.error(message);
      return;
    }

    const confirmed = window.confirm('Supprimer cette publication ?');
    if (!confirmed) {
      return;
    }

    this.isDeleteSubmitting.set(true);

    this.postInteraction
      .deletePost(this.post())
      .pipe(finalize(() => this.isDeleteSubmitting.set(false)))
      .subscribe({
        next: () => {
          const postId = this.post()._id;
          if (postId) {
            this.postsService.removePostFromTimeline(postId);
          }
        },
        error: () => undefined,
      });
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

  private resetEditForm() {
    this.editBody = '';
    this.editImageUrl = '';
    this.editImageTitle = '';
    this.editHashtags = '';
    this.editError.set('');
    this.isEditSubmitting.set(false);
  }
}
