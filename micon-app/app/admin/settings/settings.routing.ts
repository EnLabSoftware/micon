import { Routes, RouterModule }  from '@angular/router';

import { AdminSettings } from './settings.component';
import {
  SlideShow,
  SiteSettings
} from './components';

const routes: Routes = [
  {
    path: '',
    component: AdminSettings,
    children: [
      { path: 'slides', component: SlideShow },
      { path: 'site', component: SiteSettings },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  AdminSettings,
  SlideShow,
  SiteSettings
];
