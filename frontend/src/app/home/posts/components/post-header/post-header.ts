import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  LucideChevronDown,
  LucideDynamicIcon,
  LucideHeart,
  LucideMessageCircle,
} from '@lucide/angular';
import { Post as PostModel } from '../../../../../models';

@Component({
  selector: 'app-post-header',
  imports: [DatePipe, LucideDynamicIcon],
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
}
