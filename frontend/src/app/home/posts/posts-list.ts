import { Component, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post as PostModel } from '../../../models';
import { PostsFilter, PostsService } from '../../../services/posts.service';
import { PostCard } from './post';
import { PostsFilterComponent } from './components/posts-filter/posts-filter';

@Component({
  selector: 'app-posts-list',
  imports: [PostCard, PostsFilterComponent],
  templateUrl: './posts-list.html',
})
export class PostsList implements OnInit {
  readonly autoLoadEnabled = true;
  readonly postsPerPage = 5;

  posts = signal<PostModel[]>([]);
  isLoading = signal(true);
  isLoadingMore = signal(false);
  errorMessage = signal('');
  hasNextPage = signal(true);
  currentPage = signal(1);

  private currentFilter: PostsFilter = {};
  private destroyRef = inject(DestroyRef);

  constructor(private postsService: PostsService) {}

  ngOnInit(): void {
    this.reloadPosts();

    this.postsService.refreshTimeline$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadPosts());
  }

  onFilterChanged(filter: PostsFilter): void {
    this.currentFilter = filter;
    this.reloadPosts();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.autoLoadEnabled) {
      return;
    }

    if (!this.hasNextPage() || this.isLoading() || this.isLoadingMore()) {
      return;
    }

    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 250;

    if (scrollPosition >= threshold) {
      this.loadMorePosts();
    }
  }

  reloadPosts() {
    this.isLoading.set(true);
    this.isLoadingMore.set(false);
    this.errorMessage.set('');
    this.currentPage.set(1);
    this.hasNextPage.set(true);

    this.postsService.getPostsPage(1, this.postsPerPage, this.currentFilter).subscribe({
      next: (response) => {
        this.posts.set(response.data);
        this.currentPage.set(response.pagination.page);
        this.hasNextPage.set(response.pagination.hasNextPage);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les posts pour le moment.');
        this.isLoading.set(false);
      },
    });
  }

  loadMorePosts() {
    if (!this.hasNextPage() || this.isLoading() || this.isLoadingMore()) {
      return;
    }

    this.isLoadingMore.set(true);
    this.errorMessage.set('');

    const nextPage = this.currentPage() + 1;

    this.postsService.getPostsPage(nextPage, this.postsPerPage, this.currentFilter).subscribe({
      next: (response) => {
        this.posts.update((currentPosts) => [...currentPosts, ...response.data]);
        this.currentPage.set(response.pagination.page);
        this.hasNextPage.set(response.pagination.hasNextPage);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger plus de posts pour le moment.');
        this.isLoadingMore.set(false);
      },
    });
  }
}
