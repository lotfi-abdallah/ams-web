import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface PostFiltersFormValue {
  tags: string;
  from: string;
  to: string;
}

@Component({
  selector: 'app-post-filters',
  imports: [FormsModule],
  templateUrl: './post-filters.html',
})
export class PostFiltersPanel {
  isLoading = input.required<boolean>();
  isLoadingMore = input.required<boolean>();
  tags = input('');
  from = input('');
  to = input('');

  applyFilters = output<PostFiltersFormValue>();
  clearFilters = output<void>();

  tagsFilter = '';
  fromFilter = '';
  toFilter = '';

  constructor() {
    effect(() => {
      this.tagsFilter = this.tags();
      this.fromFilter = this.from();
      this.toFilter = this.to();
    });
  }

  onSubmit(event: Event) {
    event.preventDefault();

    this.applyFilters.emit({
      tags: this.tagsFilter,
      from: this.fromFilter,
      to: this.toFilter,
    });
  }

  onClear() {
    this.tagsFilter = '';
    this.fromFilter = '';
    this.toFilter = '';
    this.clearFilters.emit();
  }
}
