import { Injectable } from '@angular/core';
import { Observable, EMPTY, catchError, throwError } from 'rxjs';
import { Post as PostModel } from '../../../../models';
import { AuthService } from '../../../../services/auth.service';
import { NotificationService } from '../../../../services/notification.service';
import { PostsService } from '../../../../services/posts.service';

@Injectable({
  providedIn: 'root',
})
export class PostInteractionFacade {
  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private notification: NotificationService,
  ) {}

  isLikedByCurrentUser(post: PostModel): boolean {
    const userName = this.getCurrentUserName();

    if (!userName) {
      return false;
    }

    return post.likes.includes(userName);
  }

  toggleLike(post: PostModel): Observable<void> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userName = this.getCurrentUserName();
    if (!userName) {
      this.notification.error('Veuillez vous connecter pour aimer une publication.');
      return EMPTY;
    }

    const liked = this.isLikedByCurrentUser(post);
    const previousLikes = [...post.likes];

    post.likes = liked
      ? post.likes.filter((like: string) => like !== userName)
      : [...post.likes, userName];

    const request$ = liked
      ? this.postsService.unlikePost(postId)
      : this.postsService.likePost(postId);

    return request$.pipe(
      catchError((error) => {
        post.likes = previousLikes;
        this.notification.error("Impossible de mettre a jour le j'aime.");
        return throwError(() => error);
      }),
    );
  }

  private getCurrentUserName(): string | null {
    const currentUser = this.authService.user() as { pseudo?: string; username?: string } | null;
    return currentUser?.username ?? currentUser?.pseudo ?? null;
  }
}
