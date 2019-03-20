import { Component } from '@angular/core';

import { CompetitionService, AccountService } from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-list',
  styles: [require('./cpList.scss')],
  template: require('./cpList.html'),
})
export class CompetitionsList {
  public isLoggedIn = false;
  competitions: Competition[];
  current_tab = 'Active';
  isLoading = false;
  show_more:string;

  constructor(protected service: CompetitionService, private accountService: AccountService) {}

  ngOnInit() {
    this.isLoggedIn = this.accountService.loggedIn();
    this.isLoading = true;
    this.service.getActiveCompetitions().subscribe((data) => {
      this.competitions = data['competitions'];
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }

  getAvailable(event) {
    this.current_tab = 'All';
    this.isLoading = true;
    this.service.getAvailableCompetitions().subscribe((data) => {
      this.competitions = data['competitions'];
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }

  getActivate(event) {
    this.current_tab = 'Active';
    this.isLoading = true;
    this.service.getActiveCompetitions().subscribe((data) => {
      this.competitions = data['competitions'];
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }

  getEntered(event) {
    this.current_tab = 'Entered';
    this.isLoading = true;
    this.service.getEnteredCompetitions().subscribe((data) => {
      this.competitions = data['competitions'];
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }

  getMoreCompetitions() {
    this.service.getMoreCompetitions(this.show_more).subscribe((data) => {
      this.competitions = this.competitions.concat(data['competitions']);
      this.show_more = data['next'];
    });
  }
}
