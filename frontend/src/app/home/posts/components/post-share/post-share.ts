import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-share-form',
  imports: [FormsModule],
  templateUrl: './post-share.html',
})
export class PostShareForm {
  body = input.required<string>();
  errorMessage = input.required<string>();
  isSubmitting = input.required<boolean>();

  bodyChange = output<string>();
  submit = output<void>();
  cancel = output<void>();

  onBodyChange(value: string) {
    this.bodyChange.emit(value);
  }

  onSubmit() {
    this.submit.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
