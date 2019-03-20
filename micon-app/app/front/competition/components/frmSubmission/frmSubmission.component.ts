import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MessageService,
  AccountService,
  SubmissionService
} from '../../../../services'
import { Submission, Competition } from '../../../../models'

@Component({
  selector: 'frm-submission',
  styles: [require('./frmSubmission.scss')],
  template: require('./frmSubmission.html'),
})

export class SubmissionAttach {

  error: any;
  error_msg: string;
  @Input() competition:Competition;
  @Output() onSubmission = new EventEmitter<number>();
  submission = new Submission();
  isUploading = false;
  isLoggedIn = false;
  is_smForm = false;
  is_payForm = false;
  limit_hours = 0;

  constructor(private accountService: AccountService, private submissionService: SubmissionService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.limit_hours = 24 - (new Date().getUTCHours());
    this.isLoggedIn = this.accountService.loggedIn();
  }


  //gotoLeaderboard(uid: number): void {
  //  this.router.navigate(['c', this.competition.slug, 'leaderboard'], {queryParams:  { uid: uid }});
  //}

  formSubmit(isValid: boolean) {
    if (isValid) {
      this.isUploading = true;
      this.submissionService.createSubmission(this.competition.slug, this.submission).subscribe(
        (data) => {
          // this.messageService.infoMessage('Your submission is submitted successfully');
          this.update_entries();
          this.isUploading = false;
          this.onSubmission.emit(data['uid']);
          //this.gotoLeaderboard(data['uid']);
          // console.log(data);
        },
        (error) => {
          this.isUploading = false;
          if (error.body['message']) {
            this.error_msg = error.body['message'];
            // this.messageService.errorMessage(error.body['message']);
          } else {
            this.messageService.errorMessage('An error has occurred. Please contact the Administrator.');
          }
          // console.log(errors);
        });
    }
  }

  update_entries() {
    this.competition['can_entries'] -= 1;
    this.competition['entries'] += 1;
  }

  reset_form() {
    this.is_smForm = false;
    this.submission = new Submission();
    this.error_msg = '';
  }
}
