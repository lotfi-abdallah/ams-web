import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostsService } from '../../../services/posts.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-create-post',
  imports: [FormsModule],
  templateUrl: './create-post.html',
})
export class CreatePost {
  body = '';
  imageUrl = '';
  imageTitle = '';
  hashtags = '';
  isSubmitting = false;

  constructor(
    private postsService: PostsService,
    private notification: NotificationService,
    private auth: AuthService,
  ) {}

  isLoggedIn() {
    return !!this.auth.user();
  }

  submitPost(event: Event) {
    event.preventDefault();

    if (!this.isLoggedIn()) {
      this.notification.error('Please login to create a post.');
      return;
    }

    const trimmedBody = this.body.trim();
    const trimmedImageUrl = this.imageUrl.trim();
    const trimmedImageTitle = this.imageTitle.trim();
    const normalizedHashtags = this.hashtags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const uniqueHashtags = [...new Set(normalizedHashtags)];

    if (!trimmedBody) {
      this.notification.error('Le contenu du post est obligatoire.');
      return;
    }

    if ((trimmedImageUrl && !trimmedImageTitle) || (!trimmedImageUrl && trimmedImageTitle)) {
      this.notification.error("Renseignez l'URL et le titre de l'image ensemble.");
      return;
    }

    this.isSubmitting = true;

    this.postsService
      .createPost({
        body: trimmedBody,
        imageUrl: trimmedImageUrl || undefined,
        imageTitle: trimmedImageTitle || undefined,
        hashtags: uniqueHashtags,
      })
      .subscribe({
        next: () => {
          this.body = '';
          this.imageUrl = '';
          this.imageTitle = '';
          this.hashtags = '';
          this.postsService.notifyTimelineRefresh();
          this.notification.success('Post publié avec succès.');
          this.isSubmitting = false;
        },
        error: () => {
          this.notification.error('Impossible de publier le post.');
          this.isSubmitting = false;
        },
      });
  }
}
