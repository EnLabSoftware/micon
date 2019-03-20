import { NgModule}      from '@angular/core';
import { CommonModule}  from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MaterialModule } from '@angular/material';
import {
  OrderByPipe,
  BytesPipe
} from 'angular-pipes';
import { CKEditorModule } from 'ng2-ckeditor';

import { MomentModule } from 'angular2-moment';
// import { DisqusModule } from 'ng2-awesome-disqus';

import {
  ButtonModule,
  DialogModule,
  DataTableModule,
  SharedModule,
} from 'primeng/primeng';

import { NgaModule } from '../../theme/nga.module'
import { BaseModule } from '../base.module'
import {
  CompetitionService,
  CompetitionDataService,
  SubmissionService,
  LeaderboardService,
  PrizeService,
  ForumService,
  PaymentService
} from '../../services';
import { routing, routedComponents } from './competition.routing';
import {
  CompetitionHeader,
  CompetitionSidebar,
  CompetitionTicket,
  CompetitionDetails,
  TopicComment,
  TopicDetails,
  CompetitionDataFiles,
  CompetitionSubmissions,
  SubmissionAttach,
  CompetitionPrizes,
  CompetitionForums,
  CompetitionLeaderboard,
  TopicForm,
} from './components'

const PIPES = [
  OrderByPipe,
  BytesPipe
];

const COMPONENTS = [
  routedComponents,
  CompetitionHeader,
  CompetitionSidebar,
  CompetitionTicket,
  CompetitionDetails,
  TopicComment,
  TopicDetails,
  CompetitionDataFiles,
  CompetitionSubmissions,
  SubmissionAttach,
  CompetitionPrizes,
  CompetitionForums,
  CompetitionLeaderboard,
  TopicForm,
];


@NgModule({
  imports: [
    //A2
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LazyLoadImageModule,
    MaterialModule,
    //External
    CKEditorModule,
    DialogModule,
    ButtonModule,
    DataTableModule,
    SharedModule,
    // DisqusModule,
    MomentModule,
    //App
    NgaModule,
    BaseModule,
    routing,
  ],
  declarations: [
    COMPONENTS,
    PIPES,
  ],
  providers: [
    CompetitionService,
    CompetitionDataService,
    SubmissionService,
    LeaderboardService,
    PrizeService,
    ForumService,
    PaymentService
  ]
})
export default class CompetitionModule {
}
