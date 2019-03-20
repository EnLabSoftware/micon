import { Component, Input } from '@angular/core';

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, PrizeService } from '../../../../services'
import { Competition, Prize } from '../../../../models'

@Component({
  selector: 'cp-prize-list',
  styles: [require('./cpPrizeList.scss')],
  template: require('./cpPrizeList.html')
})
export class PrizeList {
  dataList: Prize[];
  prize: Prize = new Prize();
  editRow: Prize;
  @Input() competition:Competition;

  errorMessages: any[];
  is_create = false;
  is_edit = false;
  formSettings = {
    header: 'Prize',
    visible: false,
    appendTo: 'body',
    modal: true,
    draggable: false,
    resizable: false,
    responsive: true,
    width: 500
  };

  placeList = [
     {value: 1, name: "1st place"},
     {value: 2, name: "2nd place"},
     {value: 3, name: "3rd place"},
     {value: 4, name: "4th place"},
     {value: 5, name: "5th place"},
  ];

  constructor(private prizeService: PrizeService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.prizeService.getPrizes(this.competition.slug).subscribe((data) => {
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
    this.loadData();
    this.formSettings.visible = false;
    this.prize = new Prize();
    this.editRow = new Prize();
  }

  formCreate(isValid: boolean) {
    if (isValid) {
      this.prizeService.createPrize(this.competition.slug, this.prize).subscribe(
        (data) => {
          this.messageService.infoMessage('Prize created successfully');
          this.loadData();
          this.hideDialog();
        }, (error) => {
          this.messageService.errorMessage(error.body.error);
          this.hideDialog();
        }
      );
    }
  }

  formEdit(isValid: boolean): void {
    if (isValid) {
      this.prizeService.updateEvaluation(this.competition.slug, this.editRow).subscribe(
        (data) => {
          this.messageService.infoMessage('Prize updated successfully');
          this.hideDialog();
        },
        (errors) => {
          this.messageService.errorMessage(errors.body.error);
          this.hideDialog();
        }
      );
    }
  }

  onCreate() {
    this.is_create = true;
    this.is_edit = false;
    this.showDialog();
  }

  onEdit(data: Prize) {
    this.is_edit = true;
    this.is_create = false;
    this.editRow = data;
    this.showDialog();
  }

  onDelete(datafile: Prize): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.prizeService.deleteEvaluation(this.competition.slug, datafile.id).subscribe((data) => {
            this.messageService.infoMessage('Prize deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          }, (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

}
