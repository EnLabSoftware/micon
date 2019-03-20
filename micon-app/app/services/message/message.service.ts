import { Injectable } from '@angular/core';
import { Message } from 'primeng/primeng';

@Injectable()
export class MessageService {
  msgs: Message[] = [];

  constructor() {
  }

  infoMessage(ms: string) {
    this.msgs.push({severity: 'info', summary: 'Message', detail: ms});
  }

  errorMessage(ms: string) {
    this.msgs.push({severity: 'error', summary: 'Message', detail: ms});
  }

  warningMessage(ms: string) {
    this.msgs.push({severity: 'warn', summary: 'Message', detail: ms});
  }

  getMessages() {
    return this.msgs;
  }

  clearMessages() {
    this.msgs = [];
  }

}
