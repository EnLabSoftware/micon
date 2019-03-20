import { Component, Input,Output,EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AccountService, ForumService } from '../../../../services'
import { Competition, Topic } from '../../../../models'

@Component({
  selector: 'tp-details',
  styles: [require('./tpDetails.scss')],
  template: require('./tpDetails.html'),
})

export class TopicDetails {

  error: any;
  @Input() competition:Competition;
  @Input() tp_slug:string;
  @Output() onTab = new EventEmitter<string>();
  topic = new Topic();
  isLoggedIn = false;

  constructor(private accountService: AccountService, private activatedRouter: ActivatedRoute,
              private forumService: ForumService, private router: Router) {
  }

  ngOnInit() {
    this.activatedRouter.params.subscribe(params => {
      if (params['competition_slug']) {
        this.getTopic(params['competition_slug'], this.tp_slug);
      }
    });
    this.isLoggedIn = this.accountService.loggedIn();
  }

  getTopic(slug: string, topic_slug: string) {
    this.forumService.getTopicDetails(slug, topic_slug)
      .subscribe(
        topic => {
          this.topic = topic;
        },
        response => {
          this.error = response;
        });
  }

  onAllTopic(){
    this.onTab.emit('cp_forums');
    this.router.navigate(['c', this.competition.slug], {queryParams:  { tab: 'cp_forums' }});
  }

}
