import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DialogModule,
  ButtonModule,
  DataTableModule,
  SharedModule,
} from 'primeng/primeng';

import { routing, routedComponents } from './submissions.routing';
import { SubmissionService } from '../../services';

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
    SubmissionService
  ]
})
export default class AdminSubmissionsModule {}
