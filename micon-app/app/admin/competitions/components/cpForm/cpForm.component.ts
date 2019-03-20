import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import './cpForm.loader';

import { CompetitionService, MessageService } from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-form',
  styles: [],
  template: require('./cpForm.html'),
})
export class CompetitionForm {
  public defaultLogo = '/static/images/no-logo.png';
  public defaultImage = '/static/images/no-image.png';
  public ckeditorConfig = {
    uiColor: '#F0F3F4',
    height: '250',
  };
  public statusList = [
     {value: 1, name: "Inactivate"},
     {value: 2, name: "Activate"},
     {value: 3, name: "Finished"},
     {value: 4, name: "Incoming"},
  ];
  public typesList = [
     {value: 0, name: "----------"},
     {value: 1, name: "Supervised"},
     {value: 2, name: "Unsupervised"},
     {value: 3, name: "Reinforcement Learning"},
  ];
  private start;
  private end;
  private minStartDate = new Date();
  error:boolean = false;

  errorMessages: any[];
  competition = new Competition();

  constructor(
    private competitionService: CompetitionService, private activatedRouter: ActivatedRoute,
    private messageService: MessageService, private router: Router
  ) {}

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getCompetition(params['competition_slug']);
      }
    });
  }

  formSubmit(isValid: boolean) {
    if (isValid) {
      this.competition.start_time = this.start.toJSON();
      this.competition.end_time = this.end.toJSON();
      if (this.competition.id) {
        this.competitionService.updateCompetition(this.competition).subscribe(
          (data) => {
            this.messageService.infoMessage('Competition updated successfully');
            this.error = false;
          },
          (errors) => {
            this.messageService.errorMessage(errors.body.validate[0]);
            this.error = "True" == errors.body.error[0];
          }
        )
      } else {
        this.competitionService.createCompetition(this.competition).subscribe(
          (data) => {
            this.messageService.infoMessage('Competition created successfully');
            this.error = false;
            this.router.navigate(['sysadmin/competitions']);
          },
          (errors) => {
            this.messageService.errorMessage(errors.body.validate[0]);
            this.error = "True" == errors.body.error[0];
          }
        );
      }
    }
  }

  getCompetition(slug: string) {
    this.competitionService.getCompetition(slug)
      .subscribe(
        competition => {
          this.competition = competition;
          this.start = new Date(this.competition.start_time.toString());
          this.end = new Date(this.competition.end_time.toString());
        },
        errors => this.errorMessages = <any[]>errors);
  }

}
