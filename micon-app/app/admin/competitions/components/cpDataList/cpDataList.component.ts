import { Component, Input } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { CompetitionDataService, MessageService } from '../../../../services'
import { Competition, CompetitionData } from '../../../../models'

@Component({
  selector: 'cp-data-list',
  styles: [require('./cpDataList.scss')],
  template: require('./cpDataList.html')
})
export class DataList {
  dataList: CompetitionData[];
  typesList = [
       {value: 1, label: "X Train"},
       {value: 2, label: "Y Train"},
       {value: 3, label: "X Test"},
       {value: 4, label: "Y Test"}
  ];
  competitionData: CompetitionData = new CompetitionData();
  editRow: CompetitionData;
  @Input() competition:Competition;

  errorMessages: any[];
  is_create = false;
  is_edit = false;
  formSettings = {
    header: 'Competition Data',
    visible: false,
    appendTo: 'body',
    modal: true,
    draggable: false,
    resizable: false,
    responsive: true,
    width: 500
  };

  constructor(private competitionDataService: CompetitionDataService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.competitionDataService.getAllData(this.competition.slug).subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
      // console.log(errors);
    });
  }

  showDialog() {
    this.formSettings.visible = true;
  }

  hideDialog() {
    this.formSettings.visible = false;
    this.competitionData = new CompetitionData();
    this.editRow = new CompetitionData();
  }

  formCreate(isValid: boolean) {
    if (isValid) {
      this.competitionDataService.createCompetitionData(this.competition.slug, this.competitionData).subscribe((data) => {
        this.messageService.infoMessage('Data created successfully');
        this.loadData();
        this.hideDialog();
      }, (error) => {
        this.messageService.errorMessage(error.body.error);
        this.hideDialog();
        // console.log(error);
      });
    }
  }

  formEdit(isValid: boolean): void {
    if (isValid) {
      this.competitionDataService.updateCompetitionData(this.competition.slug, this.editRow).subscribe(
        (data) => {
          this.messageService.infoMessage('Data updated successfully');
          this.hideDialog();
        },
        (errors) => {
          this.messageService.errorMessage('An error has occurred');
          this.hideDialog();
          // console.log(errors);
        });
    }
  }

  onCreate() {
    this.is_create = true;
    this.is_edit = false;
    this.showDialog();
  }

  onEdit(data: CompetitionData) {
    this.is_edit = true;
    this.is_create = false;
    this.editRow = data;
    this.showDialog();
  }

  onDelete(datafile: CompetitionData): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.competitionDataService.deleteCompetitionData(this.competition.slug, datafile.name).subscribe((data) => {
            this.messageService.infoMessage('Data deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          }, (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

}
