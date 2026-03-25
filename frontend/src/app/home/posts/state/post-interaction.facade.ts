import { Injectable } from '@angular/core';
import { Observable, EMPTY, catchError, map, throwError } from 'rxjs';
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

  getCurrentUserNameValue(): string | null {
    return this.getCurrentUserName();
  }

  canDeleteComment(commentAuthor: string): boolean {
    const userName = this.getCurrentUserName();
    return !!userName && userName === commentAuthor;
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

  addComment(post: PostModel, texte: string): Observable<void> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userName = this.getCurrentUserName();
    if (!userName) {
      this.notification.error('Veuillez vous connecter pour commenter une publication.');
      return EMPTY;
    }

    const trimmedText = texte.trim();
    if (!trimmedText) {
      this.notification.error('Le commentaire ne peut pas etre vide.');
      return EMPTY;
    }

    return this.postsService.addComment(postId, { texte: trimmedText }).pipe(
      map((updatedPost: PostModel) => {
        post.commentaires = updatedPost.commentaires;
      }),
      catchError((error) => {
        this.notification.error("Impossible d'ajouter le commentaire.");
        return throwError(() => error);
      }),
    );
  }

  deleteComment(post: PostModel, commentId: string): Observable<void> {
    const postId = post._id;
    if (!postId || !commentId) {
      return EMPTY;
    }

    return this.postsService.deleteComment(postId, commentId).pipe(
      map((updatedPost: PostModel) => {
        post.commentaires = updatedPost.commentaires;
      }),
      catchError((error) => {
        this.notification.error('Impossible de supprimer le commentaire.');
        return throwError(() => error);
      }),
    );
  }

  private getCurrentUserName(): string | null {
    const currentUser = this.authService.user() as { pseudo?: string; username?: string } | null;
    return currentUser?.username ?? currentUser?.pseudo ?? null;
  }
}
