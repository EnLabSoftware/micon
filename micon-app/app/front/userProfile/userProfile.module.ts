import { NgModule }      from '@angular/core';
import { NgaModule } from '../../theme/nga.module';
import { BaseModule } from '../base.module'
import { CommonModule }  from '@angular/common';
import { UserProfileComponent } from './userProfile.component';
import { routing } from './userProfile.routing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule, CalendarModule } from 'primeng/primeng';
import { ImageCropperComponent } from 'ng2-img-cropper';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    BaseModule,
    DialogModule,
    CalendarModule,
    routing,
  ],
  declarations: [
    UserProfileComponent,
    ImageCropperComponent,
  ]
})
export default class UserProfileModule {}
