import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { HttpModule } from '@angular/http';
import { JwtHelper } from 'angular2-jwt/angular2-jwt'
import {
  GrowlModule,
  MessagesModule,
  ConfirmDialogModule,
  ConfirmationService,
} from 'primeng/primeng';

import { routing } from './front.routing';
import { NgaModule } from '../theme/nga.module';
import { BaseModule } from './base.module';

import { Front } from './front.component';
import { MessageService, AccountService, CompetitionService } from '../services'
import { AccountGuard } from './account-guard'
import { LoginGuard } from './login-guard'

import { Page404 } from './404NotFound';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    GrowlModule,
    MessagesModule,
    ConfirmDialogModule,
    NgaModule,
    BaseModule,
    routing
  ],
  declarations: [
    Front,
    Page404
  ],
  providers: [
    ConfirmationService,
    MessageService,
    AccountService,
    CompetitionService,
    JwtHelper,
    AccountGuard,
    LoginGuard
  ]
})
export class FrontModule {
}
