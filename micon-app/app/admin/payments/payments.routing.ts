import { Routes, RouterModule }  from '@angular/router';

import { Payments } from './payments.component';
import {
  PaymentList,
} from './components';

const routes: Routes = [
  {
    path: '',
    component: Payments,
    children: [
      { path: '', redirectTo: 'all', pathMatch: 'full' },
      { path: 'all', component: PaymentList },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Payments,
  PaymentList,
];
