import { Routes, RouterModule }  from '@angular/router';

import { Submissions } from './submissions.component';
import {
  SubmissionList,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: Submissions,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: SubmissionList },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Submissions,
  SubmissionList,
];
