import { Component } from '@angular/core';
import { Router } from "@angular/router";

import { ConfirmationService } from 'primeng/primeng';

import { MessageService, ForumService } from '../../../../services'
import { Topic } from '../../../../models'

@Component({
  selector: 'fr-list',
  template: require('./frList.html')
})
export class ForumList {
  dataList: Topic[];
  editRow: Topic;
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

  constructor(private forumService: ForumService, private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.forumService.getAllTopics().subscribe((data) => {
      this.dataList = data;
    }, (errors) => {
      this.messageService.errorMessage('An error has occurred');
      // console.log(errors);
    });
  }

  onDelete(datafile: Topic): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'fa fa-trash',
      accept: () => {
        this.forumService.deleteTopic(datafile.slug).subscribe(
          (data) => {
            this.messageService.infoMessage('Topic deleted successfully');
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
