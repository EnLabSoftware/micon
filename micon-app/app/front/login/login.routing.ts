import { Routes, RouterModule }  from '@angular/router';
import { Login } from './login.component';
import {
  LoginForm,
  ResetPassword,
  ResetPasswordConfirm
} from './components';
import { LoginGuard } from '../login-guard'


const routes: Routes = [
  {
    path: '',
    component: Login,
    children: [
      {
        path: '',
        component: LoginForm,
        canActivate: [LoginGuard],
        data: {'page_name': 'login_form'}
      },
      {
        path: 'reset-password',
        component: ResetPassword,
        canActivate: [LoginGuard],
        data: {'page_name': 'reset_password'}
      },
      {
        path: 'reset-password/confirm/:uid/:token',
        component: ResetPasswordConfirm,
        canActivate: [LoginGuard],
        data: {'page_name': 'confirm_reset_password'}
      },
    ]
  }
];

export const routing = RouterModule.forChild(routes);
export const routedComponents = [
  Login,
  LoginForm,
  ResetPassword,
  ResetPasswordConfirm
];