import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService, MessageService } from '../../../../services'
import { Account } from '../../../../models'

@Component({
  selector: 'user-form',
  styles: [require('./userForm.scss')],
  template: require('./userForm.html')
})
export class UserForm {
  account = new Account();

  constructor(private activatedRouter: ActivatedRoute, private messageService: MessageService, private router: Router
  ) {}

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {

      }
    });
  }

}
