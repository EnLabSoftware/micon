import { Routes, RouterModule }  from '@angular/router';
import { Front } from './front.component';
import { Page404 } from './404NotFound';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => System.import('./login/login.module')
  },
  {
    path: 'register',
    children: [
      { path: '', loadChildren: () => System.import('./register/register.module')},
    ]
  },
  {
    path: '',
    component: Front,
    children: [
      { path: '', loadChildren: () => System.import('./home/home.module') },
      { path: '', loadChildren: () => System.import('./competition/competition.module') },
      { path: 'u', loadChildren: () => System.import('./userProfile/userProfile.module') }
    ]
  },
  {
    path: '**',
    component: Page404
  },
];

export const routing = RouterModule.forChild(routes);
