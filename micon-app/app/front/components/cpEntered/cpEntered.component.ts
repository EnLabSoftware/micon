import { Component } from '@angular/core';
import { CompetitionService } from '../../../services'
import { Competition } from '../../../models'

@Component({
  selector: 'cp-entered',
  template: require('./cpEntered.html'),
  styles: [require('./cpEntered.scss')]
})
export class EnteredCompetitions {
  current_tab = 'Active';
  isLoading = false;
  competitions: Competition[];
  show_more:string;

  constructor (protected service: CompetitionService){}

  ngOnInit() {
    this.getActivateCP(event);
  }

  getCompletedCP(event){
    this.current_tab = 'Completed'
  }

  getActivateCP(event){
    this.current_tab = 'Active';
    this.isLoading = true;
    this.service.getEnteredCompetitions().subscribe((data) => {
      this.competitions = data['competitions'];
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }

  getTutorialCP(event){
    this.current_tab = 'Tutorial';
  }

  getMoreCompetitions() {
    this.isLoading = true;
    this.service.getMoreCompetitions(this.show_more).subscribe((data) => {
      this.competitions = this.competitions.concat(data['competitions']);
      this.isLoading = false;
      this.show_more = data['next'];
    });
  }
}

