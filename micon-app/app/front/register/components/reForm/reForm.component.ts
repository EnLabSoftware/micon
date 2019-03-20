import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator, EqualPasswordsValidator } from '../../../../theme/validators';
import { AccountService } from '../../../../services'
import { Router } from '@angular/router';


@Component({
  selector: 'register-form',
  styles: [require('./reForm.scss')],
  template: require('./reForm.html'),
})

export class RegisterForm {

  public form:FormGroup;
  public username:AbstractControl;
  public email:AbstractControl;
  public password:AbstractControl;
  public repeatPassword:AbstractControl;
  public passwords:FormGroup;
  public isExistUsername = false;
  public isExistEmail = false;
  public username_message = "This username already exists.";
  public email_message = "This email already exists.";
  public error_password;

  public submitted:boolean = false;

  constructor(private accountService: AccountService, private router: Router,private fb:FormBuilder) {
  }

  ngOnInit(){
    this.form = this.fb.group({
      'username': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
      'passwords': this.fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(8)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });

    this.username = this.form.controls['username'];
    this.email = this.form.controls['email'];
    this.passwords = <FormGroup> this.form.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];
  }

  public onSubmit(values:Object):void {
    this.submitted = true;
    if (this.form.valid) {
      this.accountService.createAccount(this.username.value, this.email.value, this.password.value, this.repeatPassword.value).subscribe(
        (data) => {
          this.router.navigate(['/register/success']);
        },
        (errors) => {
          console.log(errors);
          //this.error_password = errors.body.password1;
        }
      );
    }
  }

  onChangeUsername(event){
    if(event.target.value.trim()!=""){
      this.accountService.username_validation(event.target.value).subscribe(
        (data) => {
          this.isExistUsername = data['success'];
        },
        (errors) => {
           console.log(errors)
        })
    }else{ this.isExistUsername = false;}
  }

  onChangeEmail(event){
    if(event.target.value.trim()!=""){
      this.accountService.username_email(event.target.value).subscribe(
        (data) => {
          this.isExistEmail = data['success'];
        },
        (errors) => {
           console.log(errors)
        })
    }else{ this.isExistEmail = false;}
  }

  onChangePassword(event){
    this.error_password = '';
  }

}
