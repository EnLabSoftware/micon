import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { BaseService } from '../base.service'

@Injectable()
export class LeaderboardService {
  private competitionUrl = 'api/v1/competitions/';

  constructor(private http: Http) {
  }

  getLeaderboard(competition_slug: string, limit:number = 0, uid:number = 0): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    let url = this.competitionUrl + competition_slug + '/leaderboard/?limit=' + limit;
    if (uid) {
      url += '&uid=' + uid;
    }
    return this.http.get(url, options)
      .map(BaseService.extractData)
      .catch(BaseService.handleError);
  }

  scoringProcess(competition_slug: string, uid: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.competitionUrl + competition_slug + '/submissions/' + uid + '/scoring/', options)
      .map(BaseService.extractData)
      .catch(BaseService.handleError);
  }
}
