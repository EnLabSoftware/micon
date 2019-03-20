import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DialogModule,
  ButtonModule,
  DataTableModule,
  SharedModule,
} from 'primeng/primeng';

import { routing, routedComponents } from './forums.routing';
import { ForumService } from '../../services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    DataTableModule,
    SharedModule,
    routing
  ],
  declarations: [
    routedComponents
  ],
  providers: [
    ForumService
  ]
})
export default class AdminForumsModule {}
