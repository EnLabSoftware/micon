import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import {
  DialogModule,
  ButtonModule,
  DataTableModule,
  SharedModule,
} from 'primeng/primeng';
import { CoreService } from '../../services';
import { routing, routedComponents } from './settings.routing';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
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
    CoreService
  ]
})
export default class AdminSettingsModule {}
