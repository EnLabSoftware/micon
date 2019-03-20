import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, SubmissionService, PaymentService } from '../../../../services'
import { Payment } from '../../../../models'

@Component({
  selector: 'pm-list',
  styles: [require('./pmList.scss')],
  template: require('./pmList.html')
})
export class PaymentList {
  dataList: Payment[];

  constructor(private submissionService: SubmissionService, private paymentService: PaymentService,
              private confirmationService: ConfirmationService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.paymentService.getPayments().subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
      // console.log(errors);
    });
  }

  onDelete(datafile: Payment): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.paymentService.deletePayment(datafile.id).subscribe(
          (data) => {
            this.messageService.infoMessage('Payment deleted successfully');
            this.dataList.splice(this.dataList.indexOf(datafile), 1);
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

}
