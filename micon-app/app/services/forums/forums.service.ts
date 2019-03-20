import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { Topic } from '../../models';

@Injectable()
export class ForumService {
  private adminForumUrl = 'api/v1/forums/';
  private adminCompetitionUrl = 'api/v1/competitions/';

  constructor(private authHttp: AuthHttp, private http: Http) {
  }

  getAllTopics(): Observable<Topic[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminForumUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTopics(slug: string): Observable<Topic[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + slug + '/forums/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getTopicDetails(slug: string, topic_slug: string): Observable<Topic> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + slug + '/forums/' + topic_slug + '/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createTopic(slug: string, topic: Topic): Observable<Topic> {
    let body = FData.toFormData(topic);
    return this.authHttp.post(this.adminCompetitionUrl + slug + '/forums/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateTopic(slug: string, topic: Topic): Observable<Topic> {
    let body = FData.toFormData(topic);
    return this.authHttp.put(this.adminCompetitionUrl + slug + '/forums/' + topic.slug + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteTopic(slug: string): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.adminForumUrl + slug + "/", options)
      .map((res: Response) => {
        return res;
      })
      .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  private handleError(error: any) {
    try {
      let errors = error.json();
      return Observable.throw({
        'status': error.status,
        'ok': error.ok,
        'statusText': error.statusText,
        'url': error.url,
        'body': errors
      });
    } catch (e) {
      //if not serve it to the view as array
      return Observable.throw([error]);
    }
  }
}
