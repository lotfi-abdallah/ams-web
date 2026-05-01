import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, Observable, Subject } from 'rxjs';
import { Post } from '../models';

export interface PostsFilter {
  sort?: 'newest' | 'oldest' | 'mostLiked';
  hashtag?: string;
  author?: number;
  excludeAuthor?: number;
  hideShared?: boolean;
}

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
  private prependPostSubject = new Subject<Post>();
  prependPost$ = this.prependPostSubject.asObservable();
  private removePostSubject = new Subject<string>();
  removePost$ = this.removePostSubject.asObservable();

  constructor(private api: ApiService) {}

  getPostsPage(
    page: number,
    limit: number,
    filter: PostsFilter = {},
  ): Observable<PaginatedPostsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filter.sort) params.set('sort', filter.sort);
    if (filter.hashtag) params.set('hashtag', filter.hashtag);
    if (filter.author) params.set('author', String(filter.author));
    if (filter.excludeAuthor) params.set('excludeAuthor', String(filter.excludeAuthor));
    if (filter.hideShared) params.set('hideShared', 'true');
    return this.api.get<PaginatedPostsResponse>(`posts?${params.toString()}`);
  }

  getPosts(page: number, limit: number): Observable<Post[]> {
    return this.getPostsPage(page, limit).pipe(map((response) => response.data));
  }

  getPost(postId: string): Observable<Post> {
    return this.api.get<Post>(`posts/${postId}`);
  }

  createPost(postData: {
    body: string;
    imageUrl?: string;
    imageTitle?: string;
    hashtags?: string[];
  }): Observable<Post> {
    return this.api.post<Post>('posts', postData);
  }

  likePost(postId: string): Observable<void> {
    return this.api.post<void>(`posts/${postId}/like`, {});
  }

  unlikePost(postId: string): Observable<void> {
    return this.api.post<void>(`posts/${postId}/unlike`, {});
  }

  addComment(postId: string, commentData: { text: string }): Observable<Post> {
    return this.api
      .post<{ post: Post }>(`posts/${postId}/comment`, commentData)
      .pipe(map((response) => response.post));
  }

  deleteComment(postId: string, commentId: string): Observable<Post> {
    return this.api
      .delete<{ post: Post }>(`posts/${postId}/comment/${commentId}`)
      .pipe(map((response) => response.post));
  }

  sharePost(postId: string, body: string): Observable<Post> {
    return this.api.post<Post>(`posts/${postId}/share`, { body });
  }

  updatePost(
    postId: string,
    postData: {
      body: string;
      imageUrl?: string;
      imageTitle?: string;
      hashtags?: string[];
    },
  ): Observable<Post> {
    return this.api.put<Post>(`posts/${postId}`, postData);
  }

  deletePost(postId: string): Observable<{ message: string; postId: string }> {
    return this.api.delete<{ message: string; postId: string }>(`posts/${postId}`);
  }

  notifyTimelineRefresh() {
    this.refreshTimelineSubject.next();
  }

  prependPostToTimeline(post: Post) {
    this.prependPostSubject.next(post);
  }

  removePostFromTimeline(postId: string) {
    this.removePostSubject.next(postId);
  }
}
