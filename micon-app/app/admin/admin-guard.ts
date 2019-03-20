import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt/angular2-jwt';

import { AccountService } from '../services';
import { Account } from '../models';

@Injectable()
export class AdminGuard implements CanActivate {

    account: Account;

    constructor(private router: Router, private accountService: AccountService) { }

    canActivate() {
        if (tokenNotExpired()) {
            // logged in so return true
            if(this.accountService.loggedIn()){
              this.account = this.accountService.getLocalAccount();
              if (this.account.is_staff) {
                return true;
              } else {
                this.router.navigate(['/']);
                return false
              }
            }
        }

        // not logged in so redirect to login page
        this.router.navigate(['login']);
        return false;
    }
}
