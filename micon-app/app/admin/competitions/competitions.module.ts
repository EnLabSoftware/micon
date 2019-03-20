import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { CKEditorModule } from 'ng2-ckeditor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DialogModule,
  ButtonModule,
  DataTableModule,
  CalendarModule,
  SharedModule,
} from 'primeng/primeng';

import { NgaModule } from '../../theme/nga.module';
import { routing, routedComponents } from './competitions.routing';
import {
  CompetitionService,
  CompetitionDataService,
  PrizeService,
  EvaluationService
} from '../../services';

import {
  DataList,
  EvaluationList,
  PrizeList
} from './components'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgaModule,
    CKEditorModule,
    DialogModule,
    ButtonModule,
    DataTableModule,
    CalendarModule,
    SharedModule,
    routing
  ],
  declarations: [
    routedComponents,
    DataList,
    PrizeList,
    EvaluationList
  ],
  providers: [
    CompetitionService,
    CompetitionDataService,
    PrizeService,
    EvaluationService
  ]
})
export default class AdminCompetitionsModule {}
