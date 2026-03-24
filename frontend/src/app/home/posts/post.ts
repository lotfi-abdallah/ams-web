import { Component, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  LucideChevronDown,
  LucideDynamicIcon,
  LucideHeart,
  LucideMessageCircle,
} from '@lucide/angular';
import { Post as PostModel } from '../../../models';

@Component({
  selector: 'app-post',
  imports: [DatePipe, LucideDynamicIcon],
  templateUrl: './post.html',
})
export class PostCard {
  post = input.required<PostModel>();
  isWrapped = signal(false);
  readonly heartIcon = LucideHeart;
  readonly commentIcon = LucideMessageCircle;
  readonly chevronIcon = LucideChevronDown;

  toggleWrap() {
    this.isWrapped.update((value) => !value);
  }
}
