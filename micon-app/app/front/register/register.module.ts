import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseModule } from '../base.module';

import { Register } from './register.component';
import { routing, routedComponents } from './register.routing';
import { AccountService } from '../../services/account/account.service';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BaseModule,
    routing
  ],
  declarations: [
    routedComponents,
  ],
  providers: [
    AccountService
  ]
})
export default class RegisterModule {}
