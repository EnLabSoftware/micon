import { Component, ViewEncapsulation } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription }   from 'rxjs/Subscription';

import { AccountService, CoreService } from '../../../../services';

@Component({
  selector: 'login-form',
  encapsulation: ViewEncapsulation.None,
  styles: [require('./loginForm.scss')],
  template: require('./loginForm.html'),
})
export class LoginForm {

  public form: FormGroup;
  public username: AbstractControl;
  public password: AbstractControl;
  public submitted: boolean = false;

  public errorMessages: string;
  public isLoggedIn = false;
  public subscription: Subscription;

  constructor(private fb: FormBuilder, private router: Router,
              private coreService: CoreService, private accountService: AccountService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(4)])],
      'password': ['', Validators.compose([Validators.required, Validators.minLength(4)])]
    });

    this.username = this.form.controls['username'];
    this.password = this.form.controls['password'];
  }

  public onSubmit(values: Object): void {
    this.submitted = true;
    if (this.form.valid) {
      this.accountService.login(this.username.value, this.password.value).subscribe(
        result => {
          this.coreService.getToken().subscribe(
            res => {
              this.router.navigate(['/']);
            },
            error => {
              // console.log(error);
            });
        },
        errors => {
          this.errorMessages = errors.body.error_message[0];
        }
      )
    }
  }
}
