import { Routes, RouterModule }  from '@angular/router';

import { Competitions } from './competitions.component';
import {
  CompetitionList,
  CompetitionForm
} from './components';

const routes: Routes = [
  {
    path: '',
    component: Competitions,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: CompetitionList },
      { path: 'add', component: CompetitionForm },
      { path: ':competition_slug', component: CompetitionForm },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Competitions,
  CompetitionForm,
  CompetitionList
];
