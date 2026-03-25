import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, Observable, Subject } from 'rxjs';
import { Post } from '../models';

export interface PaginatedPostsResponse {
  data: Post[];
  pagination: {
    page: number;
    limit: number;
    totalPosts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private refreshTimelineSubject = new Subject<void>();
  refreshTimeline$ = this.refreshTimelineSubject.asObservable();

  constructor(private api: ApiService) {}

  getPostsPage(page: number, limit: number): Observable<PaginatedPostsResponse> {
    return this.api.get<PaginatedPostsResponse>(`posts?page=${page}&limit=${limit}`);
  }

  getPosts(page: number, limit: number): Observable<Post[]> {
    return this.getPostsPage(page, limit).pipe(map((response) => response.data));
  }

  getPost(postId: string): Observable<Post> {
    return this.api.get<Post>(`posts/${postId}`);
  }

  createPost(postData: { texte: string; image?: string }): Observable<Post> {
    return this.api.post<Post>('posts', postData);
  }

  likePost(postId: string): Observable<void> {
    return this.api.post<void>(`posts/${postId}/like`, {});
  }

  unlikePost(postId: string): Observable<void> {
    return this.api.post<void>(`posts/${postId}/unlike`, {});
  }

  addComment(postId: string, commentData: { texte: string }): Observable<Post> {
    return this.api
      .post<{ post: Post }>(`posts/${postId}/comment`, commentData)
      .pipe(map((response) => response.post));
  }

  deleteComment(postId: string, commentId: string): Observable<Post> {
    return this.api
      .delete<{ post: Post }>(`posts/${postId}/comment/${commentId}`)
      .pipe(map((response) => response.post));
  }

  notifyTimelineRefresh() {
    this.refreshTimelineSubject.next();
  }
}
