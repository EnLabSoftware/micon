import { NgModule }      from '@angular/core';
import { NgaModule } from '../../theme/nga.module';
import { CommonModule }  from '@angular/common';
import { Home } from './home.component';
import { routing } from './home.routing';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
  imports: [
    CommonModule,
    NgaModule,
    LazyLoadImageModule,
    routing
  ],
  declarations: [
    Home,
  ]
})
export default class HomeModule {}
