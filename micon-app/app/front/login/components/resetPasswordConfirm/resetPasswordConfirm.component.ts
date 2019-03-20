import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EqualPasswordsValidator } from '../../../../theme/validators';
import { AccountService } from '../../../../services'
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'reset-password-confirm',
  styles: [require('./resetPasswordConfirm.scss')],
  template: require('./resetPasswordConfirm.html'),
})

export class ResetPasswordConfirm {

  public form:FormGroup;
  public password:AbstractControl;
  public repeatPassword:AbstractControl;
  public passwords:FormGroup;
  public token: string;
  public uid: string;
  public error_password = '';
  public errorMessages = '';
  public successMessages:boolean = false;

  public submitted:boolean = false;

  constructor(private accountService: AccountService, private fb:FormBuilder,
              private activatedRouter: ActivatedRoute) {}

  ngOnInit(){
    this.form = this.fb.group({
      'passwords': this.fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];

    this.activatedRouter.params.subscribe(params => {
      this.token = params['token'];
      this.uid = params['uid'];
    });
  }

  public onSubmit(values:Object):void {
    this.submitted = true;
    if (this.form.valid) {
      this.accountService.confirm_resetPassword(
          this.password.value, this.repeatPassword.value, this.uid, this.token
      ).subscribe(
        (data) => {
          this.successMessages = true;
          this.errorMessages = '';
        },
        (errors) => {
          if(errors.body.token){
            this.errorMessages = 'Invalid token';
          }
          else if(errors.body.uid){
            this.errorMessages = 'Invalid uid';
          }
          else if(errors.body.new_password2){
            this.error_password = errors.body.new_password2;
          }
          else {
            this.errorMessages = 'An error has occur. Please contact administrator.';
          }
          this.successMessages = false;
        }
      )
    }
  }

  onChangePassword(event){
    this.error_password = '';
  }
}
