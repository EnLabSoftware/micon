import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';

import { AccountService, CoreService } from '../../../services';
import { Account } from '../../../models';

@Component({
  selector: 'fr-base-top',
  styles: [require('./frBaseTop.scss')],
  template: require('./frBaseTop.html'),
})
export class FrBaseTop {
  public isLoggedIn = false;
  public subscription: Subscription;
  account = new Account();

  constructor(private router: Router, private accountService: AccountService, private coreService: CoreService) {
    this.subscription = accountService.missionAnnounced$.subscribe(
      mission => {
        this.account = this.accountService.getLocalAccount();
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.accountService.loggedIn();
    this.subscription = this.accountService.isLoggedIn$.subscribe(
      status => {
          this.isLoggedIn = status;
    });
    if(this.isLoggedIn){
      this.account = this.accountService.getLocalAccount();
    }
  }

  logout() {
    this.accountService.logout().subscribe(
      res => {
        this.coreService.getToken().subscribe(
          res => {
            this.router.navigate(['/login']);
          },
          error => {
            // console.log(error);
          });
      },
      error => {
        console.log(error);
      }
    );
  }
}

