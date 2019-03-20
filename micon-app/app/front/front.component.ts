import { Component, ViewEncapsulation } from '@angular/core';
import { Message } from 'primeng/primeng';

import { MessageService } from '../services'

@Component({
  selector: 'front',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./front.scss')],
  template: require('./front.html'),
})
export class Front {
  msgs: Message[] = [];

  constructor(private messageService: MessageService) {
  }

  ngOnInit() {
    this.messageService.clearMessages();
    this.msgs = this.messageService.getMessages();
  }
}
