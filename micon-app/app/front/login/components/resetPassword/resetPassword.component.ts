import { Component } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { EmailValidator } from '../../../../theme/validators';

import { AccountService } from '../../../../services';


@Component({
  selector: 'reset-password-form',
  styles: [require('./resetPassword.scss')],
  template: require('./resetPassword.html'),
})
export class ResetPassword {

  public form:FormGroup;
  public email:AbstractControl;
  public submitted: boolean = false;
  public successMessages = '';

  constructor(private fb: FormBuilder, private accountService: AccountService) {
  }

  ngOnInit(){
    this.form = this.fb.group({
      'email': ['', Validators.compose([Validators.required, EmailValidator.validate])],
    });
    this.email = this.form.controls['email'];
  }

  public onSubmit(values: Object): void {
    this.submitted = true;
    if (this.form.valid) {
      this.accountService.resetPassword(this.email.value).subscribe(
        (success) => {
          this.successMessages = 'Password reset e-mail has been sent. ' +
              'Please check your email to reset your password.'
        },
        (errors) => {
          console.log(errors)
        }
      )
    }
  }
}
