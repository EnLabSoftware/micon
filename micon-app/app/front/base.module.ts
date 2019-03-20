import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { RouterModule } from '@angular/router'
import { FormsModule } from '@angular/forms';

import {
  FrLoginTop,
  FrBaseTop,
  FrBaseBottom,
  AuthSocial,
  EnteredCompetitions
} from './components'

const BASE_COMPONENTS = [
  FrLoginTop,
  FrBaseTop,
  FrBaseBottom,
  AuthSocial,
  EnteredCompetitions
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  declarations: [
    ...BASE_COMPONENTS
  ],
  exports: [
    ...BASE_COMPONENTS
  ]
})
export class BaseModule {
}
