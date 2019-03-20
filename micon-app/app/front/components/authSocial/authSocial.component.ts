import { Component } from '@angular/core';
import { EmailValidator, EqualPasswordsValidator } from '../../../theme/validators';
import { MessageService, AccountService, CoreService } from '../../../services'
import { Router } from '@angular/router';
import { Account } from '../../../models';


declare const FB:any;
@Component({
  selector: 'auth-social',
  styles: [require('./authSocial.scss')],
  template: require('./authSocial.html'),
})
export class AuthSocial {

  constructor(private accountService: AccountService, private router: Router,
              private messageService: MessageService, private coreService: CoreService ) {
    FB.init({
      appId      : this.coreService.getSetting('FB_APP_ID'),
      cookie     : false,  // enable cookies to allow the server to access the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.5' // use graph api version 2.5
    });

  }

  ngOnInit(){
    this.startGoogle();
  }

  onFacebookLoginClick() {
    FB.login((response:any)=> {
      if (response.authResponse){
        this.social_login_success(response.authResponse.accessToken)
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }

  onGoogleLoginClick(){
    this.startGoogle();
  }

  social_login_success(accessToken){
    this.accountService.social_login('facebook', accessToken).subscribe(
      (data) => {
        this.coreService.getToken().subscribe(
          res => {
            this.router.navigate(['/']);
          },
          error => {
            // console.log(error);
          });
      },
      (errors) => {
        this.messageService.errorMessage('An error has occur. Please contact administrator.')
      }
    );
  }

  startGoogle() {
    let accountService = this.accountService;
    let messageService = this.messageService;
    let coreService = this.coreService;
    let router = this.router;
    let GOOGLE = (<any>window).gapi;
    GOOGLE.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      let auth2 = GOOGLE.auth2.init({
        client_id: coreService.getSetting('GG_APP_ID'),
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      auth2.attachClickHandler(document.getElementById('GoogleLogin'), {},
        function (GoogleUser) {
          let accessToken = GoogleUser.Zi.access_token;
          accountService.social_login('google', accessToken).subscribe(
            (data) => {
              coreService.getToken().subscribe(
                res => {
                  router.navigate(['/']);
                },
                error => {
                  // console.log(error);
                });
            },
            (errors) => {
              messageService.errorMessage('An error has occur. Please contact administrator.')
            }
          );
        }, function (error) {
          alert(JSON.stringify(error, undefined, 2));
        })
    })
  }
}
