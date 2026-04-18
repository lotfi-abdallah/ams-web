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

  get hasActiveFilters(): boolean {
    return this.sortOption() !== 'newest' || this.hashtagInput().trim() !== '';
  }

  applySort(sort: 'newest' | 'oldest' | 'mostLiked'): void {
    this.sortOption.set(sort);
    this.emit();
  }

  applyHashtag(): void {
    this.emit();
  }

  clearFilters(): void {
    this.sortOption.set('newest');
    this.hashtagInput.set('');
    this.emit();
  }

  private emit(): void {
    this.filterChanged.emit({
      sort: this.sortOption(),
      hashtag: this.hashtagInput().trim() || undefined,
    });
  }
}
