import { Component, input, output } from '@angular/core';
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

  applyFilters = output<PostFiltersFormValue>();
  clearFilters = output<void>();

  tagsFilter = '';
  fromFilter = '';
  toFilter = '';

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
