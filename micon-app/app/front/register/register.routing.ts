import { Routes, RouterModule }  from '@angular/router';
import { Register } from './register.component';
import {
  ReSuccess,
  ReConfirmMsg,
  RegisterForm
} from './components';
import { LoginGuard } from '../login-guard'

const routes: Routes = [
  {
    path: '',
    component: Register,
    children: [
      {
        path: '',
        component: RegisterForm,
        canActivate: [LoginGuard],
        data: {'page_name': 'register_form'}
      },
      {
        path: 'success',
        component: ReSuccess,
        canActivate: [LoginGuard],
        data: {'page_name': 'register_success'}
      },
      {
        path: 'confirm/:key/:username',
        component: ReConfirmMsg,
        canActivate: [LoginGuard],
        data: {'page_name': 'register_confirm_msg'}
      },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Register,
  ReSuccess,
  ReConfirmMsg,
  RegisterForm
];