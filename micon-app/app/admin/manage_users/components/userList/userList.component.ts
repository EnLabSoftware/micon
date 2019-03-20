import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { MessageService,AccountService } from '../../../../services'
//import { AccountService } from '../../../../account'
import { Account } from '../../../../models'

@Component({
  selector: 'users-list',
  styles: [require('./userList.scss')],
  template: require('./userList.html')
})
export class UserList {
  dataList: Account[];

  constructor(private router: Router, private confirmationService: ConfirmationService,
              private messageService: MessageService, private accountService: AccountService) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.accountService.getAccounts().subscribe(
      (data) => {
        this.dataList = data;
      },
      (errors) => {
        this.messageService.errorMessage('An error has occurred');
      }
    );
  }

  onDelete(data: Account): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Delete user',
      icon: 'fa fa-trash',
      accept: () => {
        this.accountService.deleteAccount(data).subscribe(
          (data) => {
            this.loadData()
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
          }
        )
      }
    });
  }

  onInactive(data: Account): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to inactive this user?',
      header: 'Inactive user',
      icon: 'fa fa-lock',
      accept: () => {
        this.accountService.activeAccount(data).subscribe(
          (data) => {
            this.loadData()
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
          }
        )
      }
    });
  }

}
