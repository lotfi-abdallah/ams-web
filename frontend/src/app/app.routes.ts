import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { MyComponent } from './my-component/my-component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'my-component',
    component: MyComponent,
  },
];
