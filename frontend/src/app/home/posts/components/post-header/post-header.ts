import { Component, input, output } from '@angular/core';
import {
  LucideChevronDown,
  LucideDynamicIcon,
  LucideHeart,
  LucideMessageCircle,
} from '@lucide/angular';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-header',
  imports: [LucideDynamicIcon],
  templateUrl: './post-header.html',
})
export class PostHeader {
  post = input.required<PostModel>();
  isWrapped = input.required<boolean>();
  isLikedByCurrentUser = input.required<boolean>();
  toggleWrap = output<void>();

  readonly heartIcon = LucideHeart;
  readonly commentIcon = LucideMessageCircle;
  readonly chevronIcon = LucideChevronDown;

  onToggleWrap() {
    this.toggleWrap.emit();
  }

  authorLabel(): string {
    return this.post().createdByUser?.pseudo ?? `User #${this.post().createdBy}`;
  }

  authorInitial(): string {
    const pseudo = this.post().createdByUser?.pseudo?.trim();
    return pseudo ? pseudo.charAt(0).toUpperCase() : String(this.post().createdBy).charAt(0);
  }

  publishedAt(): string {
    return `${this.post().date} ${this.post().hour}`;
  }
}
