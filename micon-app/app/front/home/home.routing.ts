import { Routes, RouterModule }  from '@angular/router';

import { Home } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: Home
  }
];

export const routing = RouterModule.forChild(routes);
