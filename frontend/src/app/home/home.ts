import { Component } from '@angular/core';
import { Timeline } from './timeline';

@Component({
  selector: 'app-home',
  imports: [Timeline],
  templateUrl: './home.html',
})
export class Home {}
