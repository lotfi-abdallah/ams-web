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
  texte = '';
  image = '';
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

    const trimmedText = this.texte.trim();
    const trimmedImage = this.image.trim();

    if (!trimmedText) {
      this.notification.error('Le texte du post est obligatoire.');
      return;
    }

    this.isSubmitting = true;

    this.postsService
      .createPost({
        texte: trimmedText,
        image: trimmedImage || undefined,
      })
      .subscribe({
        next: () => {
          this.texte = '';
          this.image = '';
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
