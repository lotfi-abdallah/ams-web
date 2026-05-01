import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostsFilter } from '../../../../../services/posts.service';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-posts-filter',
  imports: [FormsModule],
  templateUrl: './posts-filter.html',
})
export class PostsFilterComponent {
  filterChanged = output<PostsFilter>();

  sortOption = signal<'newest' | 'oldest' | 'mostLiked'>('newest');
  hashtagInput = signal('');
  hideShared = signal(false);
  ownerOption = signal<'all' | 'mine' | 'others'>('all');
  readonly currentUser: AuthService['user'];

  constructor(private auth: AuthService) {
    this.currentUser = this.auth.user;
  }

  get hasActiveFilters(): boolean {
    return (
      this.sortOption() !== 'newest' ||
      this.hashtagInput().trim() !== '' ||
      this.hideShared() ||
      this.ownerOption() !== 'all'
    );
  }

  applySort(sort: 'newest' | 'oldest' | 'mostLiked'): void {
    this.sortOption.set(sort);
    this.emit();
  }

  applyHashtag(): void {
    this.emit();
  }

  applyHideShared(value: boolean): void {
    this.hideShared.set(value);
    this.emit();
  }

  applyOwner(option: 'all' | 'mine' | 'others'): void {
    if (option !== 'all' && this.getCurrentUserId() === null) {
      return;
    }
    this.ownerOption.set(option);
    this.emit();
  }

  clearFilters(): void {
    this.sortOption.set('newest');
    this.hashtagInput.set('');
    this.hideShared.set(false);
    this.ownerOption.set('all');
    this.emit();
  }

  private emit(): void {
    const userId = this.getCurrentUserId();
    const ownerOption = this.ownerOption();
    this.filterChanged.emit({
      sort: this.sortOption(),
      hashtag: this.hashtagInput().trim() || undefined,
      hideShared: this.hideShared() || undefined,
      author: ownerOption === 'mine' && userId !== null ? userId : undefined,
      excludeAuthor: ownerOption === 'others' && userId !== null ? userId : undefined,
    });
  }

  private getCurrentUserId(): number | null {
    const user = this.currentUser();
    return typeof user?.id === 'number' ? user.id : null;
  }
}
