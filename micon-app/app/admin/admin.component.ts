import { Component, ViewEncapsulation } from '@angular/core';

import { Message } from 'primeng/primeng';

import { MessageService } from '../services'

@Component({
  selector: 'admin-panel',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./admin.scss')],
  template: require('./admin.html'),
})
export class AdminPanel {
  msgs: Message[] = [];

  constructor(private messageService: MessageService) {
  }

  ngOnInit() {
    this.msgs = this.messageService.getMessages();
  }
}
