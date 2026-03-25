import { Component, DestroyRef, HostListener, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Post as PostModel } from '../../../models';
import { PostFilters, PostsService } from '../../../services/posts.service';
import { PostCard } from './post';
import { PostFiltersFormValue, PostFiltersPanel } from './components/post-filters/post-filters';

@Component({
  selector: 'app-posts-list',
  imports: [PostFiltersPanel, PostCard],
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
  activeTagsFilter = '';
  activeFromFilter = '';
  activeToFilter = '';

  private destroyRef = inject(DestroyRef);

  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((queryParams) => {
      this.activeTagsFilter = queryParams.get('tags') ?? '';
      this.activeFromFilter = queryParams.get('from') ?? '';
      this.activeToFilter = queryParams.get('to') ?? '';
      this.reloadPosts();
    });

    this.postsService.refreshTimeline$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reloadPosts());
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

    this.postsService.getPostsPage(1, this.postsPerPage, this.getCurrentFilters()).subscribe({
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

    this.postsService
      .getPostsPage(nextPage, this.postsPerPage, this.getCurrentFilters())
      .subscribe({
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

  onApplyFilters(filters: PostFiltersFormValue) {
    const normalizedTags = filters.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const normalizedTagsValue =
      normalizedTags.length > 0 ? [...new Set(normalizedTags)].join(',') : null;
    const normalizedFrom = filters.from.trim() || null;
    const normalizedTo = filters.to.trim() || null;

    const currentTags = this.route.snapshot.queryParamMap.get('tags');
    const currentFrom = this.route.snapshot.queryParamMap.get('from');
    const currentTo = this.route.snapshot.queryParamMap.get('to');

    if (
      currentTags === normalizedTagsValue &&
      currentFrom === normalizedFrom &&
      currentTo === normalizedTo
    ) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tags: normalizedTagsValue,
        from: normalizedFrom,
        to: normalizedTo,
      },
      queryParamsHandling: 'merge',
    });
  }

  onClearFilters() {
    const currentTags = this.route.snapshot.queryParamMap.get('tags');
    const currentFrom = this.route.snapshot.queryParamMap.get('from');
    const currentTo = this.route.snapshot.queryParamMap.get('to');

    if (!currentTags && !currentFrom && !currentTo) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tags: null,
        from: null,
        to: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private getCurrentFilters(): PostFilters {
    const tags = this.activeTagsFilter
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    return {
      tags: tags.length ? [...new Set(tags)] : undefined,
      from: this.activeFromFilter || undefined,
      to: this.activeToFilter || undefined,
    };
  }
}
