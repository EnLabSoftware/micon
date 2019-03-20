import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { Submission } from '../../models';

@Injectable()
export class SubmissionService {
  private competitionUrl = 'api/v1/competitions/';
  private submissionUrl = 'api/v1/submissions/';

  constructor(private authHttp: AuthHttp) {
  }

  getAllSubmissions(): Observable<Submission[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.submissionUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createSubmission(slug: string, submission: Submission): Observable<Submission> {
    let body = FData.toFormData(submission);
    return this.authHttp.post(this.competitionUrl + slug + '/submissions/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSubmission(submission: Submission): Observable<Submission> {
    let body = FData.toFormData(submission);
    return this.authHttp.put(this.submissionUrl + submission.uid + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCompetitionSubmission(competition_slug: string, submission: Submission): Observable<Submission> {
    let body = FData.toFormData(submission);
    return this.authHttp.put(this.competitionUrl + competition_slug + '/submissions/' + submission.uid + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSubmissions(competition_slug: string): Observable<Submission[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.competitionUrl + competition_slug + '/submissions/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  // For Admin Panel
  deleteSubmission(uid: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.submissionUrl + uid + "/", options)
      .map((res: Response) => {
        return res;
      })
      .catch(this.handleError);
  }

  //For user to delete their own submission
  deleteCompetitionSubmission(competition_slug: string, submission_id: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.competitionUrl + competition_slug + '/submissions/' + submission_id + "/", options)
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
