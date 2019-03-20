import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/primeng';

import {
  MessageService,
  AccountService,
  SubmissionService
} from '../../../../services'
import { Competition, Submission } from '../../../../models'

@Component({
  selector: 'cp-submissions',
  template: require('./cpSubmissions.html'),
})

export class CompetitionSubmissions {

  error: any;
  @Input() competition:Competition;
  @Output() onTab = new EventEmitter<string>();
  submissions: Submission[];
  editRow: Submission;
  formSettings = {
    header: 'Edit Description',
    visible: false,
    appendTo: 'body',
    modal: true,
    draggable: false,
    resizable: false,
    responsive: true,
    width: 500
  };
  isLoggedIn = false;
  isLoading = true;

  constructor(private accountService: AccountService, private submissionService: SubmissionService,
              private activatedRouter: ActivatedRoute, private confirmationService: ConfirmationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getSubmissions(params['competition_slug']);
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }


  getSubmissions(slug: string) {
    this.submissionService.getSubmissions(slug).subscribe(
      data => {
        this.submissions = data;
        this.isLoading = false;
      },
      error => {
        this.error = error
      }
    );
  }

  onEdit(data: Submission): void {
    this.showDialog();
    this.editRow = data;
  }

  formSubmit(isValid: boolean): void {
    if (isValid) {
      this.submissionService.updateCompetitionSubmission(this.competition.slug, this.editRow).subscribe(
        (data) => {
          this.messageService.infoMessage('Submission updated successfully');
          this.hideDialog();
        },
        (errors) => {
          this.messageService.errorMessage('An error has occurred');
          this.hideDialog();
          // console.log(errors);
        });
    }
  }

  showDialog() {
    this.formSettings.visible = true;
  }

  hideDialog() {
    this.formSettings.visible = false;
    this.editRow = new Submission();
  }

  onDelete(submission: Submission): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      accept: () => {
        this.submissionService.deleteCompetitionSubmission(this.competition.slug, submission.uid).subscribe(
          (data) => {
            this.messageService.infoMessage('Submission deleted successfully');
            this.submissions.splice(this.submissions.indexOf(submission), 1);
          },
          (errors) => {
            this.messageService.errorMessage('An error has occurred');
            // console.log(errors);
          });
      }
    });
  }

  getTab(){
    this.onTab.emit('sm_attach')
  }
}
