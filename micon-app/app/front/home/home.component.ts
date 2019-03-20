import { Component, ViewEncapsulation } from '@angular/core';
import { CoreService, CompetitionService } from '../../services'
import { SlideSetting, Competition } from '../../models'


@Component({
  selector: 'page-home',
  template: require('./home.html'),
  styles: [require('./home.scss')],
  encapsulation: ViewEncapsulation.None
})

export class Home {
  slides_list: SlideSetting[];
  incoming_competitions: Competition[];

  constructor(private coreService: CoreService, private competitionService: CompetitionService) {}

  ngOnInit(){
    this.loadSlides();
    this.loadIncomingCompetitions();
  }

  loadSlides(){
    this.coreService.getFrontSettings().subscribe(
      (data) => {
        this.slides_list = data['slides_setting'];
      },
      (errors) => {
        console.log(errors)
      }
    )
  }

  loadIncomingCompetitions(){
    this.competitionService.getIncomingCompetitions().subscribe(
      (data) => {
        this.incoming_competitions = data
      },
      (errors) => {
        console.log(errors)
      }
    )
  }

}

