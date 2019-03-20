import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRoute } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt/angular2-jwt';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(private router: Router) {}

    canActivate() {
        if (tokenNotExpired()) {
            // logged in so return false
            this.router.navigate(['/']);
            return false;
        }
        // not logged in so redirect to login page
        return true;
    }
}
