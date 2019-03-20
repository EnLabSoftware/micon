import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountService, PrizeService } from '../../../../services'
import { Competition, Prize } from '../../../../models'

@Component({
  selector: 'cp-prizes',
  template: require('./cpPrizes.html'),
})

export class CompetitionPrizes {

  error: any;
  @Input() competition:Competition;
  prizeList: Prize[];
  isLoggedIn = false;
  isLoading = true;

  constructor(private accountService: AccountService, private prizeService: PrizeService,
              private activatedRouter: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getPrizes(params['competition_slug']);
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }

  getPrizes(slug: string) {
    this.prizeService.getPrizes(slug).subscribe(
      data => {
        this.prizeList = data;
        this.isLoading = false
      },
      error => {
        this.error = error
      }
    );
  }

}
