import { Component, ViewChild, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

window['CKEDITOR_BASEPATH'] = '//cdn.ckeditor.com/4.5.9/standard/';
require('ckeditor');

import {
  MessageService,
  AccountService,
  CompetitionService,
  ForumService
} from '../../../../services'
import { Competition, Topic } from '../../../../models'

@Component({
  selector: 'tp-form',
  styles: [require('./tpForm.scss')],
  template: require('./tpForm.html'),
})

export class TopicForm {

  error: any;
  @Input() competition:Competition;
  topic = new Topic();
  isLoggedIn = false;
  isUploading = false;
  upload_files: File[] = [];
  ckeditorConfig = {
    uiColor: '#F0F3F4',
    height: '250',
    toolbarGroups: [
      {"name":"basicstyles","groups":["basicstyles"]},
      {"name":"links","groups":["links"]},
      {"name":"paragraph","groups":["list","blocks"]},
      {"name":"insert","groups":["insert"]},
      {"name":"undo","groups":["undo"]},
    ],
    removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar'
  };

  @ViewChild('fileUpload') protected _fileUpload:ElementRef;

  constructor(private accountService: AccountService, private competitionService: CompetitionService,
              private forumService: ForumService, private messageService: MessageService,
              private router: Router, private activatedRouter: ActivatedRoute) {
  }

  ngOnInit() {
    this.isLoggedIn = this.accountService.loggedIn();
  }


  onFiles() {
    let files = this._fileUpload.nativeElement.files;
    if (files.length) {
      for(let i=0; i<files.length; i++) {
        this.upload_files.push(files[i]);
      }
    }
  }

  removeUpload(index: number) {
    this.upload_files.splice(index, 1);
    console.log(this.upload_files);
  }

  reloadAttachments() {
    this.topic.attachments = this.upload_files;
  }

  gotoTopic(tp_slug: string): void {
    //this.router.navigate(['c', this.competition.slug, 'forums', 't', tp_slug]);
    this.router.navigate(['c', this.competition.slug], {queryParams:  { tp_slug: tp_slug }});
  }

  formSubmit(isValid: boolean) {
    this.reloadAttachments();
    if (isValid) {
      this.isUploading = true;
      this.forumService.createTopic(this.competition.slug, this.topic).subscribe(
        (data) => {
          this.messageService.infoMessage('Topic is created successfully');
          this.gotoTopic(data['topic_slug']);
        },
        (error) => {
          this.isUploading = false;
          this.messageService.errorMessage('An error has occurred.');
        });
    }
  }

  reset_form() {
    this.topic = new Topic();
  }

}
