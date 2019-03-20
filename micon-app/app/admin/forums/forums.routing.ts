import { Routes, RouterModule }  from '@angular/router';

import { Forums } from './forums.component';
import {
  ForumList,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: Forums,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: ForumList },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Forums,
  ForumList,
];
