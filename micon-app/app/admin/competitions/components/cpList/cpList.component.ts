import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, CompetitionService } from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-list',
  styles: [require('./cpList.scss')],
  template: require('./cpList.html')
})
export class CompetitionList {
  dataList: Competition[];

  constructor(private competitionService: CompetitionService, private router: Router,
              private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.competitionService.getCompetitions().subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
    });
  }

  onCreate(): void {
    this.router.navigate(['sysadmin/competitions/add']);
  }

  onEdit(datafile: Competition): void {
    this.router.navigate(['sysadmin/competitions', datafile.slug]);
  }

  onDelete(datafile: Competition): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.competitionService.deleteCompetition(datafile.slug).subscribe(
          (data) => {
            this.messageService.infoMessage('Competition deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
          }
        );
      }
    });
  }

}
