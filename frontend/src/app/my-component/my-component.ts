import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-my-component',
  imports: [],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
})
export class MyComponent {
  myState = signal('Hello, World!');

  updateState() {
    this.myState.set('State updated!');
  }
}
