import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-edit-form',
  imports: [FormsModule],
  templateUrl: './post-edit.html',
})
export class PostEditForm {
  body = input.required<string>();
  imageUrl = input.required<string>();
  imageTitle = input.required<string>();
  hashtags = input.required<string>();
  errorMessage = input.required<string>();
  isSubmitting = input.required<boolean>();

  bodyChange = output<string>();
  imageUrlChange = output<string>();
  imageTitleChange = output<string>();
  hashtagsChange = output<string>();
  submit = output<void>();
  cancel = output<void>();

  onBodyChange(value: string) {
    this.bodyChange.emit(value);
  }

  onImageUrlChange(value: string) {
    this.imageUrlChange.emit(value);
  }

  onImageTitleChange(value: string) {
    this.imageTitleChange.emit(value);
  }

  onHashtagsChange(value: string) {
    this.hashtagsChange.emit(value);
  }

  onSubmit() {
    this.submit.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
