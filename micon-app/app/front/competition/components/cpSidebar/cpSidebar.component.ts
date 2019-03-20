import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Competition } from '../../../../models'
import { LeaderboardService } from './../../../../services'

@Component({
  selector: 'cp-sidebar',
  styles: [require('./cpSidebar.scss')],
  template: require('./cpSidebar.html'),
})

export class CompetitionSidebar {

  @Input() competition:Competition;
  @Input() isLoggedIn:boolean;
  @Input() current_page:string;
  @Output() onTab = new EventEmitter<string>();

  leaderboard: any;
  limit = 10;
  error: any;
  leaderboard_error: any;

  constructor(private activatedRoute: ActivatedRoute, private leaderboardService: LeaderboardService,
              private router: Router) {}

  ngOnInit(){
    this.activatedRoute.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getLeaderboard(params['competition_slug'], this.limit);
      }
    });
  }

  getLeaderboard(slug: string, limit: number) {
    this.leaderboardService.getLeaderboard(slug, limit).subscribe(
      data => {
        this.leaderboard = data['leaderboard'];
      },
      error => {
        this.leaderboard_error = error
      }
    );
  }

  getTab(tab){
    this.current_page = tab;
    this.onTab.emit(this.current_page);
    this.router.navigate(['c', this.competition.slug], {queryParams:  { tab: tab }});
  }
}
