import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService, CoreService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'register-confirm-msg',
  template: require('./reConfirmMsg.html'),
  styles: [require('./reConfirmMsg.scss')],
})

export class ReConfirmMsg {

  public is_verified:boolean = false;

  constructor (private accountService: AccountService, private activatedRouter: ActivatedRoute,
               private router: Router, private coreService: CoreService) {}

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      this.accountService.is_verified_email(params['username']).subscribe(
        data => {
          this.is_verified = data['is_verified']
        }
      );
      this.accountService.verify_email(params['key']).subscribe(
        data => {
          if(data.url.endsWith('/register/confirm')){
            if(this.is_verified){
              this.router.navigate(['/login']);
            }else {
              this.accountService.log_user_in(params['username']).subscribe(
                data => {
                  this.coreService.getToken().subscribe(
                  res => {
                    console.log('competition');
                    this.router.navigate(['/competitions']);
                  },
                  error => {
                    // console.log(error);
                  });
                }
              )
            }
          }else{
            this.router.navigate(['/login']);
          }
        },
        errors => {
          this.router.navigate(['/login']);
        }
      );
    });
  }
}
