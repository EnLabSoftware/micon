import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  AccountService,
  LeaderboardService
} from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-leaderboard',
  styles: [require('./cpLeaderboard')],
  template: require('./cpLeaderboard.html'),
})

export class CompetitionLeaderboard {

  error: any;
  scoring_error: any;
  leaderboard: any;
  @Input() competition:Competition;
  @Input() sub_id:number;
  @Output() onTab = new EventEmitter<string>();
  leaderboard_processing = false;
  isLoggedIn = false;
  is_new = false;
  improved_positions = 0;
  leaderboard_visible = true;
  entry_score:number = 0;
  isLoading = true;

  constructor(private accountService: AccountService, private leaderboardService: LeaderboardService,
              private activatedRouter: ActivatedRoute) {
  }

  ngOnInit() {
    let slug: string;
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        slug = params['competition_slug'];
      }
    });
    if (slug) {
      if (this.sub_id) {
        this.getLeaderboard(slug, this.sub_id);
      } else {
        this.getLeaderboard(slug);
      }
    }
    this.isLoggedIn = this.accountService.loggedIn();
  }

  get_extra_row_template(score: number): string {
    let message;
    if(this.is_new){
      message = `Your submission scored <strong>` + score + `</strong>.`;
    }else{
      if(this.improved_positions>0){
        message = `Congratulations, your submission scored <strong>` + score + `</strong>, you have improved by ` + this.improved_positions + ` positions!`;
      }else{
        message = `Your submission scored <strong>` + score + `</strong>, which is not an improvement of your best score. Keep trying!`;
      }
    }
    return `
      <tr class="your_entry_score">
        <td colspan="6">
          <div class="ui-grid ui-grid-responsive ui-fluid">
            <div class="ui-grid-row">
              <div class="ui-grid-col-12">
                <strong>Your Entry ↑</strong><br>` + message + `
              </div>
            </div>
          </div>
        </td>
      </tr>
      `;
  }

  gotoCurrentRank() {
    let inter = setInterval(() => {
      let el = jQuery('.user-current-rank');
      if (el.length) {
        this.leaderboard_visible = true;
        el.after(this.get_extra_row_template(this.entry_score));
        jQuery('html, body').animate({scrollTop: el.position().top}, {duration:1000});
        clearInterval(inter);
      }
    }, 1000);
  }

  getLeaderboard(slug: string, uid:number = 0) {
    this.leaderboardService.getLeaderboard(slug, 0, uid)
      .subscribe(
        data => {
          this.leaderboard = data['leaderboard'];
          this.isLoading = false;
          //Scoring process
          if (data['unprocessed']) {
            setTimeout(() => {
              this.scoring_process(slug, uid);
            }, 500);
          }
        },
        error => this.error = error);
  }

  scoring_process(slug: string, uid: number) {
    this.leaderboard_processing = true;
    this.leaderboardService.scoringProcess(slug, uid)
      .subscribe(
        data => {
          this.leaderboard_visible = false;
          if (data['leaderboard']) {
            this.leaderboard = data['leaderboard'];
            this.entry_score = Math.floor((data['entry_score']*Math.pow(10,5)))/Math.pow(10,5);
            this.is_new = data['is_new'];
            this.improved_positions = data['improved'];
            this.leaderboard_visible = true;
            setTimeout(() => {
              this.leaderboard_processing = false;
              this.gotoCurrentRank();
            }, 5000);
          }
        },
        error => this.scoring_error = error);
  }

  customRowClass(rowData, rowIndex): string {
    return rowData.current_rank && (rowIndex + 1) == rowData.current_rank ? 'user-current-rank' : '';
  }

  getTab(tab){
    this.onTab.emit(tab);
  }
}
