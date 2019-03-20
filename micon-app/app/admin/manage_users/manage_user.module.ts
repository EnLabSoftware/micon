import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { routing, routedComponents } from './manage_user.routing';
import { AccountService } from '../../services/account/account.service';
import {
  DataTableModule,
} from 'primeng/primeng';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgaModule,
    FormsModule,
    DataTableModule,
    routing
  ],
  declarations: [
    routedComponents
  ],
  providers: [
    AccountService
  ]
})
export default class ManageUserModule {}
