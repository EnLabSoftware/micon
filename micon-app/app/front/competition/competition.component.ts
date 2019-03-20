import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService, CompetitionService } from '../../services'
import { Competition } from '../../models'
@Component({
  selector: 'page-competition',
  styles: [require('./competition.scss')],
  //template: `<router-outlet></router-outlet>`,
  template: require('./competition.html'),
  encapsulation: ViewEncapsulation.None,
})
export class Competitions {
  error: any;
  competition = new Competition();
  isLoggedIn = false;
  current_tab:string = 'cp_details';
  tp_slug:string = '';
  sub_id:number;

  constructor(private accountService: AccountService, private competitionService: CompetitionService,
              private activatedRouter: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getCompetition(params['competition_slug']);
      }
    });
    this.activatedRouter.queryParams.subscribe(params => {
      if (params['tab']) {
        this.current_tab = params['tab'];
      }
      if (params['topic']){
        this.tp_slug = params['topic'];
        this.current_tab = 'tp_details';
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }

  getCompetition(slug: string) {
    this.competitionService.getCompetition(slug)
      .subscribe(
        competition => {
          this.competition = competition;
        },
        response => {
          this.error = response;
        });
  }

  onTab(tab){
    this.current_tab = tab;
  }

  onSubmission(submission_id){
    this.sub_id = submission_id;
    this.current_tab = 'cp_leaderboard';
  }
}

