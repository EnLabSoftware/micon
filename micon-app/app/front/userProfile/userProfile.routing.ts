import { Routes, RouterModule }  from '@angular/router';

import { UserProfileComponent } from './userProfile.component';
import { AccountGuard } from '../account-guard'
const routes: Routes = [
  {
    path: ':username',
    component: UserProfileComponent,
    canActivate: [AccountGuard],
    data: {'page_name': 'user_profile'}
  }
];

export const routing = RouterModule.forChild(routes);
