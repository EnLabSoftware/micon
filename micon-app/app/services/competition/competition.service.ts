import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { Competition } from '../../models';

@Injectable()
export class CompetitionService {
  private adminCompetitionUrl = 'api/v1/competitions/';

  constructor(private http: Http, private authHttp: AuthHttp) {
  }

  getCompetitions(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.adminCompetitionUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getIncomingCompetitions(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + 'incoming/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getActiveCompetitions(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + 'activate/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getEnteredCompetitions(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.adminCompetitionUrl + 'entered/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getAvailableCompetitions(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + 'available/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getMoreCompetitions(url:string): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(url, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompetitionGallery(): Observable<Competition[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + 'gallery/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getCompetition(slug: string): Observable<Competition> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + slug + "/", options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCompetition(competition: Competition): Observable<Competition> {
    let body = FData.toFormData(competition);
    return this.authHttp.put(this.adminCompetitionUrl + competition.slug + "/", body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createCompetition(competition: Competition): Observable<Competition> {
    let body = FData.toFormData(competition);
    return this.authHttp.post(this.adminCompetitionUrl, body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteCompetition(slug: string): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.adminCompetitionUrl + slug + "/", options)
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
