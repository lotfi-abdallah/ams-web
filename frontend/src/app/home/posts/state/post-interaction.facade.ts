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
    const userId = this.getCurrentUserId();

    if (userId === null) {
      return false;
    }

    return Array.isArray(post.likedBy) && post.likedBy.includes(userId);
  }

  getCurrentUserIdValue(): number | null {
    return this.getCurrentUserId();
  }

  canDeleteComment(commentedBy: number): boolean {
    const userId = this.getCurrentUserId();
    return userId !== null && userId === commentedBy;
  }

  toggleLike(post: PostModel): Observable<void> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userId = this.getCurrentUserId();
    if (userId === null) {
      this.notification.error('Veuillez vous connecter pour aimer une publication.');
      return EMPTY;
    }

    const liked = this.isLikedByCurrentUser(post);
    const safeLikedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
    const previousLikedBy = [...safeLikedBy];
    const previousLikesCount = post.likes;

    post.likedBy = liked
      ? safeLikedBy.filter((like: number) => like !== userId)
      : [...safeLikedBy, userId];
    post.likes = post.likedBy.length;

    const request$ = liked
      ? this.postsService.unlikePost(postId)
      : this.postsService.likePost(postId);

    return request$.pipe(
      catchError((error) => {
        post.likedBy = previousLikedBy;
        post.likes = previousLikesCount;
        this.notification.error("Impossible de mettre a jour le j'aime.");
        return throwError(() => error);
      }),
    );
  }

  addComment(post: PostModel, text: string): Observable<void> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userId = this.getCurrentUserId();
    if (userId === null) {
      this.notification.error('Veuillez vous connecter pour commenter une publication.');
      return EMPTY;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      this.notification.error('Le commentaire ne peut pas etre vide.');
      return EMPTY;
    }

    return this.postsService.addComment(postId, { text: trimmedText }).pipe(
      map((updatedPost: PostModel) => {
        post.comments = updatedPost.comments;
      }),
      catchError((error) => {
        this.notification.error("Impossible d'ajouter le commentaire.");
        return throwError(() => error);
      }),
    );
  }

  updateComment(post: PostModel, commentIndex: number, text: string): Observable<void> {
    const postId = post._id;
    if (!postId || commentIndex < 0) {
      return EMPTY;
    }

    return this.postsService.updateComment(postId, commentIndex, text).pipe(
      map((updatedPost: PostModel) => {
        post.comments = updatedPost.comments;
      }),
      catchError((error) => {
        this.notification.error('Impossible de modifier le commentaire.');
        return throwError(() => error);
      }),
    );
  }

  deleteComment(post: PostModel, commentIndex: number): Observable<void> {
    const postId = post._id;
    if (!postId || commentIndex < 0) {
      return EMPTY;
    }

    return this.postsService.deleteComment(postId, commentIndex).pipe(
      map((updatedPost: PostModel) => {
        post.comments = updatedPost.comments;
      }),
      catchError((error) => {
        this.notification.error('Impossible de supprimer le commentaire.');
        return throwError(() => error);
      }),
    );
  }

  sharePost(postId: string | undefined, body: string): Observable<PostModel> {
    if (!postId) {
      return EMPTY;
    }

    const userId = this.getCurrentUserId();
    if (userId === null) {
      this.notification.error('Veuillez vous connecter pour partager une publication.');
      return EMPTY;
    }

    const trimmedBody = body.trim();
    if (trimmedBody.length < 3) {
      this.notification.error('Le message doit contenir au moins 3 caracteres.');
      return EMPTY;
    }

    return this.postsService.sharePost(postId, trimmedBody).pipe(
      catchError((error) => {
        this.notification.error('Impossible de partager cette publication.');
        return throwError(() => error);
      }),
    );
  }

  updatePost(
    post: PostModel,
    payload: {
      body: string;
      imageUrl?: string;
      imageTitle?: string;
      hashtags?: string[];
    },
  ): Observable<PostModel> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userId = this.getCurrentUserId();
    if (userId === null) {
      this.notification.error('Veuillez vous connecter pour modifier une publication.');
      return EMPTY;
    }

    if (post.createdBy !== userId) {
      this.notification.error("Vous n'etes pas autorise a modifier ce post.");
      return EMPTY;
    }

    const trimmedBody = payload.body.trim();
    if (!trimmedBody) {
      this.notification.error('Le contenu du post est obligatoire.');
      return EMPTY;
    }

    if (trimmedBody.length > 300) {
      this.notification.error('Le contenu du post ne peut pas depasser 300 caracteres.');
      return EMPTY;
    }

    return this.postsService
      .updatePost(postId, {
        ...payload,
        body: trimmedBody,
      })
      .pipe(
        catchError((error) => {
          this.notification.error('Impossible de modifier cette publication.');
          return throwError(() => error);
        }),
      );
  }

  deletePost(post: PostModel): Observable<void> {
    const postId = post._id;
    if (!postId) {
      return EMPTY;
    }

    const userId = this.getCurrentUserId();
    if (userId === null) {
      this.notification.error('Veuillez vous connecter pour supprimer une publication.');
      return EMPTY;
    }

    if (post.createdBy !== userId) {
      this.notification.error("Vous n'etes pas autorise a supprimer ce post.");
      return EMPTY;
    }

    return this.postsService.deletePost(postId).pipe(
      map(() => undefined),
      catchError((error) => {
        this.notification.error('Impossible de supprimer cette publication.');
        return throwError(() => error);
      }),
    );
  }

  private getCurrentUserId(): number | null {
    const currentUser = this.authService.user() as { id?: number } | null;
    return typeof currentUser?.id === 'number' ? currentUser.id : null;
  }
}
