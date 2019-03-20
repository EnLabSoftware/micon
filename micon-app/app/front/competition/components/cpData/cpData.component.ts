import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService, CompetitionDataService } from '../../../../services'
import { Competition, CompetitionData } from '../../../../models'

@Component({
  selector: 'cp-data',
  template: require('./cpData.html'),
})

export class CompetitionDataFiles {

  error: any;
  @Input() competition:Competition;
  competitionDataList: CompetitionData[];
  isLoggedIn = false;
  isLoading = true;

  constructor(private accountService: AccountService, private competitionDataService: CompetitionDataService,
              private activatedRouter: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getCompetitionData(params['competition_slug']);
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }

  getCompetitionData(slug: string) {
    this.competitionDataService.getLearningData(slug).subscribe(
      data => {
        this.competitionDataList = data;
        this.isLoading = false;
      },
      error => {
        this.error = error
      }
    );
  }

}
