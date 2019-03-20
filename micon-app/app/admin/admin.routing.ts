import { Routes, RouterModule }  from '@angular/router';
import { AdminPanel } from './admin.component';
import { AdminGuard } from './admin-guard';

const routes: Routes = [
  {
    path: 'sysadmin',
    component: AdminPanel,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => System.import('./dashboard/dashboard.module') },
      { path: 'competitions', loadChildren: () => System.import('./competitions/competitions.module') },
      { path: 'submissions', loadChildren: () => System.import('./submissions/submissions.module') },
      { path: 'payments', loadChildren: () => System.import('./payments/payments.module') },
      { path: 'forums', loadChildren: () => System.import('./forums/forums.module') },
      { path: 'settings', loadChildren: () => System.import('./settings/settings.module') },
      { path: 'users', loadChildren: () => System.import('./manage_users/manage_user.module') },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
