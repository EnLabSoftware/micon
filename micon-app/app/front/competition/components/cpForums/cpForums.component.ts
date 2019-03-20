import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import {
  AccountService,
  ForumService
} from '../../../../services'
import { Competition, Topic } from '../../../../models'

@Component({
  selector: 'cp-forums',
  styles: [require('./cpForums.scss')],
  template: require('./cpForums.html'),
})

export class CompetitionForums {

  error: any;
  @Input() competition:Competition;
  @Output() onTab = new EventEmitter<string>();
  topicList: Topic[];
  isLoggedIn = false;
  loadding_forums = true;

  constructor(private accountService: AccountService, private forumService: ForumService,
              private activatedRouter: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getForums(params['competition_slug']);
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }


  getForums(slug: string) {
    this.loadding_forums = true;
    this.forumService.getTopics(slug)
      .subscribe(
        data => {
          this.topicList = data;
          this.loadding_forums = false;
        },
        error => {
          this.error = error
        });
  }

  getTab(tab){
    this.onTab.emit(tab)
  }

  getTopic(tp_slug){
    this.onTab.emit('tp_details');
    this.router.navigate(['c', this.competition.slug], {queryParams:  { topic: tp_slug }});
  }
}
