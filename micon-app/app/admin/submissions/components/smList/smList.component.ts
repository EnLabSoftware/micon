import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, SubmissionService } from '../../../../services'
import { Submission } from '../../../../models'

@Component({
  selector: 'sm-list',
  styles: [require('./smList.scss')],
  template: require('./smList.html')
})
export class SubmissionList {
  dataList: Submission[];
  editRow: Submission;
  formSettings = {
    header: 'Edit description',
    visible: false,
    appendTo: 'body',
    modal: true,
    draggable: false,
    resizable: false,
    responsive: true,
    width: 500
  };

  constructor(private submissionService: SubmissionService, private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.submissionService.getAllSubmissions().subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
      // console.log(errors);
    });
  }

  onEdit(data: Submission): void {
    this.showDialog();
    this.editRow = data;
  }

  onDelete(datafile: Submission): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.submissionService.deleteSubmission(datafile.uid).subscribe(
          (data) => {
            this.messageService.infoMessage('Submission deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

  formSubmit(isValid: boolean): void {
    if (isValid) {
      this.submissionService.updateSubmission(this.editRow).subscribe(
        (data) => {
          this.messageService.infoMessage('Submission updated successfully');
          this.hideDialog();
        },
        (errors) => {
          this.messageService.errorMessage('An error has occurred');
          this.hideDialog();
          // console.log(errors);
        });
    }
  }

  showDialog() {
    this.formSettings.visible = true;
  }

  hideDialog() {
    this.formSettings.visible = false;
    this.editRow = new Submission();
  }

}
