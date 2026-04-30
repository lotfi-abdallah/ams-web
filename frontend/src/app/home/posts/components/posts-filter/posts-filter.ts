import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostsFilter } from '../../../../../services/posts.service';

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

  get hasActiveFilters(): boolean {
    return this.sortOption() !== 'newest' || this.hashtagInput().trim() !== '' || this.hideShared();
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

  clearFilters(): void {
    this.sortOption.set('newest');
    this.hashtagInput.set('');
    this.hideShared.set(false);
    this.emit();
  }

  private emit(): void {
    this.filterChanged.emit({
      sort: this.sortOption(),
      hashtag: this.hashtagInput().trim() || undefined,
      hideShared: this.hideShared() || undefined,
    });
  }
}
