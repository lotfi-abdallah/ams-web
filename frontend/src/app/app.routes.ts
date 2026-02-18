import { Routes } from '@angular/router';
import { App } from './app';
import { MyComponent } from './my-component/my-component';

export const routes: Routes = [
  {
    path: '',
    component: App,
  },
  {
    path: 'my-component',
    component: MyComponent,
  },
];
