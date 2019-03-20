import { Routes, RouterModule }  from '@angular/router';

import { ManageUser } from './manage_user.component';
import {
  UserList,
  UserForm
} from './components';

const routes: Routes = [
  {
    path: '',
    component: ManageUser,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: UserList },
      { path: 'add', component: UserForm },
      //{ path: ':competition_slug', component: CompetitionForm },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  ManageUser,
  UserList,
  UserForm
];
