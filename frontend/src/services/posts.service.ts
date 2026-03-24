import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Post } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  constructor(private api: ApiService) {}

  getPosts(page: number, limit: number): Observable<Post[]> {
    return this.api.get<Post[]>(`posts?page=${page}&limit=${limit}`);
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

  addComment(postId: string, commentData: { texte: string }): Observable<void> {
    return this.api.post<void>(`posts/${postId}/comment`, commentData);
  }

  deleteComment(postId: string, commentId: string): Observable<void> {
    return this.api.delete<void>(`posts/${postId}/comment/${commentId}`);
  }
}
