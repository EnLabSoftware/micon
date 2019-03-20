import { Routes, RouterModule }  from '@angular/router';

import { Competitions } from './competition.component';
import {
  CompetitionsList,
  CompetitionGallery,
  CompetitionLeaderboard
} from './components';
import { AccountGuard } from '../account-guard'

const routes: Routes = [
  {
    path: 'c/:competition_slug',
    component: Competitions,
  },
    //children: [
    //  {
    //    path: '',
    //    component: CompetitionDetails,
    //    data:{'page_name': 'cp_details'}
    //  },
    //  {
    //    path: 'data',
    //    component: CompetitionDataFiles,
    //    data:{'page_name': 'cp_data'}
    //  },
      {
        path: 'c/:competition_slug/leaderboard',
        component: CompetitionLeaderboard,
        data:{'page_name': 'cp_leaderboard'}
      },
    //  {
    //    path: ':competition_slug/submissions',
    //    component: CompetitionSubmissions,
    //    canActivate: [AccountGuard],
    //    data:{'page_name': 'cp_submissions'}
    //  },
    //  {
    //    path: ':competition_slug/prizes',
    //    component: CompetitionPrizes,
    //    data:{'page_name': 'cp_prizes'}
    //  },
    //  {
    //    path: ':competition_slug/forums',
    //    component: CompetitionForums,
    //    data:{'page_name': 'cp_forums'}
    //  },
    //  {
    //    path: ':competition_slug/forums/topics/new',
    //    component: TopicForm,
    //    canActivate: [AccountGuard],
    //    data:{'page_name': 'cp_forums'}
    //  },
    //  {
    //    path: ':competition_slug/forums/t/:topic_slug',
    //    component: TopicDetails,
    //    data:{'page_name': 'cp_forums'}
    //  },
    //  {
    //    path: ':competition_slug/submissions/attach',
    //    component: SubmissionAttach,
    //    data:{'page_name': 'sm_attach'}
    //  },
    //]
  //},
  { path: 'competitions', component: CompetitionsList },
  { path: 'gallery', component: CompetitionGallery },
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Competitions,
  CompetitionGallery,
  CompetitionsList,
  CompetitionLeaderboard,
];
