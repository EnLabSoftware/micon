import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';

import { routing }       from './admin.routing';
import { NgaModule } from '../theme/nga.module';
import {
  GrowlModule,
  MessagesModule,
  ConfirmDialogModule,
  ConfirmationService
} from 'primeng/primeng';

import { AdminPanel } from './admin.component';
import { MessageService } from '../services'
import { AdminGuard } from './admin-guard';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    GrowlModule,
    MessagesModule,
    ConfirmDialogModule,
    routing
  ],
  declarations: [AdminPanel],
  providers: [
    AdminGuard,
    MessageService,
    ConfirmationService
  ]
})
export class AdminModule {
}
