import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EmailValidator, EqualPasswordsValidator } from '../../theme/validators';
import { Message } from 'primeng/primeng';
import { ImageCropperComponent, CropperSettings, Bounds } from 'ng2-img-cropper';


import {
  AccountService,
  MessageService
} from '../../services'
import { Account } from '../../models'


@Component({
  selector: 'user-profile',
  encapsulation: ViewEncapsulation.None,
  template: require('./userProfile.html'),
  styles: [require('./userProfile.scss')],
})
export class UserProfileComponent {
  public isLoggedInUser = true;
  public isLoggedIn = false;
  public isIncorrectPwd = false;
  public isChangePwd = false;
  public changePwdForm:FormGroup;
  public currentPassword:AbstractControl;
  public password:AbstractControl;
  public repeatPassword:AbstractControl;
  public passwords:FormGroup;
  display_upload: boolean = false;
  error: any[];
  account = new Account();
  public defaultImage = '/static/images/no-image.png';
  current_tab = 'Account';
  username:string = '';
  public user_email: string;
  public genders = [
    {value: 0, name: "Male"},
    {value: 1, name: "Female"}
  ];
  public isEditInfo = false;
  public isExistEmail = false;
  public email_message = "This email already exists.";

  private bday;

  avatar_uploaded:any;
  cropperSettings1:CropperSettings;

  @ViewChild('cropper', undefined)
  cropper:ImageCropperComponent;


  constructor(private accountService: AccountService, private activatedRouter: ActivatedRoute,
              private messageService: MessageService, private fb:FormBuilder) {
    this.cropperSettings1 = new CropperSettings();

    this.cropperSettings1.width = 200;
    this.cropperSettings1.height = 200;

    this.cropperSettings1.croppedWidth = 200;
    this.cropperSettings1.croppedHeight = 200;

    this.cropperSettings1.canvasWidth = 500;
    this.cropperSettings1.canvasHeight = 300;

    this.cropperSettings1.minWidth = 200;
    this.cropperSettings1.minHeight = 200;

    this.cropperSettings1.noFileInput = true;

    this.cropperSettings1.rounded = false;
    this.cropperSettings1.keepAspect = false;

    this.cropperSettings1.cropperDrawSettings.strokeColor = 'rgba(255,255,255,1)';
    this.cropperSettings1.cropperDrawSettings.strokeWidth = 2;

    this.avatar_uploaded = {};
  }

  ngOnInit() {
    this.changePwdForm = this.fb.group({
      'currentPassword':['', Validators.compose([Validators.required, Validators.minLength(6)])],
      'passwords': this.fb.group({
        'password': ['', Validators.compose([Validators.required, Validators.minLength(6)])],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(6)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
    });
    this.currentPassword = this.changePwdForm.controls['currentPassword'];
    this.passwords = <FormGroup> this.changePwdForm.controls['passwords'];
    this.password = this.passwords.controls['password'];
    this.repeatPassword = this.passwords.controls['repeatPassword'];

    this.isLoggedIn = this.accountService.loggedIn();
    this.activatedRouter.params.subscribe(params => {
      this.username = params['username'];
      if (this.username == this.accountService.loggedInAccountUserName()) {
        this.isLoggedInUser = true;
        this.ReloadAccount();
        this.error = null;
        this.current_tab = 'Account'
      } else {
        this.isLoggedInUser = false;
        this.getUserProfile(this.username);
        this.current_tab = 'Home'
      }
    });
  }

  ReloadAccount(){
    this.account = this.accountService.getLocalAccount();
    this.bday = new Date(this.account.birth_day)
  }

  getUserProfile(username: string){
    this.accountService.getAccount(username).subscribe(
      account => {
        this.account = account;
      },
      response => {
        this.error = response
      }
    );
  }

  cropped(bounds:Bounds) {
    console.log('cropped image')
  }

  fileChangeListener($event) {
    try{
      var image:any = new Image();
      var file:File = $event.target.files[0];
      var myReader:FileReader = new FileReader();
      var that = this;
      myReader.onloadend = function (loadEvent:any) {
        image.src = loadEvent.target.result;
        that.cropper.setImage(image);
      };

      myReader.readAsDataURL(file);
    }
    catch(e){
      console.log(e)
    }
  }


  formSubmit(isValid){
    if(isValid){
      this.updateAvatar();
    }
  }


  // change avatar with cropper
  //avatarChange(){
  //  this.display_upload = true;
  //}

  // change avatar without cropper
  avatarChange(){
    this.accountService.updateAvatar(this.account).subscribe(
      (data) => {
        this.messageService.infoMessage('Your avatar is updated successfully.');
        this.accountService.announceMission('Call frBaseTop update');
      },
      (errors) => {
        this.messageService.errorMessage(errors.body.error);
        this.ReloadAccount();
      }
    );
  }

  updateAvatar(){
    console.log(this.account);
    this.account.avatar = this.avatar_uploaded.image;
    this.accountService.updateAvatar(this.account).subscribe(
      (data) => {
        this.display_upload = false;
        this.messageService.infoMessage('Your avatar is updated successfully.');
        this.accountService.announceMission('Call frBaseTop update');
        this.ReloadAccount();
      },
      (errors) => {
        this.messageService.errorMessage(errors.body.error);
      }
    );
  }

  getTab(tab){
    this.current_tab = tab
  }

  changePwd(event){
    this.isChangePwd = true;
  }

  cancelChangePwd(event){
    this.isChangePwd = false;
    this.changePwdForm.reset();
  }

  public SaveChangePwd(values:Object):void {
    if (this.changePwdForm.valid) {
      if (this.currentPassword.value == this.password.value){
        this.messageService.errorMessage('Your new and old password are too similar !');
      }else{
        this.accountService.changePassword(this.currentPassword.value, this.password.value, this.repeatPassword.value).subscribe(
          (data) => {
            this.messageService.infoMessage('Your password is updated successfully.');
            this.isChangePwd = false;
            this.changePwdForm.reset();
          },
          (errors) => {
            console.log(errors);
            if (errors.body.old_password){
              this.messageService.errorMessage('Your old password is incorrect. Please try again!')
            } else {
              for (var i = 0 ; i < errors.body.new_password2.length ; i++){
                this.messageService.errorMessage(errors.body.new_password2[i])
              }
            }
          }
        )
      }
    }
  }

//Update info
  fSubmit(isValid: boolean) {
    if (isValid && !this.isExistEmail) {
      let month = parseInt(this.bday.getMonth()) + 1;
      this.account.birth_day = this.bday.getFullYear() + '-' + month.toString() + '-' + this.bday.getDate();
      this.accountService.updateInfo(this.account).subscribe(
        (data) => {
          this.messageService.infoMessage('Your submission is submitted successfully!');
          this.isEditInfo = !this.isEditInfo;
          this.ReloadAccount();
          this.accountService.announceMission('Call frBaseTop update');
        },
        (errors) => {
           this.messageService.errorMessage('An error has occurred. Please try again or contact administrator!');
        }
      );
    } else {
      this.messageService.errorMessage('You entered invalid values. Please try again!');
    }
  }

  cancelEditInfo(event) {
    this.isEditInfo = false;
    this.ReloadAccount()
  }

  editInfo() {
    this.isEditInfo = true;
    this.user_email = this.account.email;
  }

  onChangeEmail(event){
    if(event.target.value.trim()!=""){
      this.accountService.username_email(event.target.value).subscribe(
        (data) => {
          if (data['success'] && event.target.value == this.user_email) {
            this.isExistEmail = false;
          } else {
            this.isExistEmail = data['success'];
          }
        },
        (errors) => {
           console.log(errors)
        }
      )
    } else { this.isExistEmail = false; }
  }

  onDisplayName(event) {
    let val = event.target.value;
    this.account.display_name = val.replace("  ", " ")
  }
//End Update info

}
