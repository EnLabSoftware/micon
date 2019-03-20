import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { CompetitionData } from '../../models';

@Injectable()
export class CompetitionDataService {
  private adminCompetitionUrl = 'api/v1/competitions/';

  constructor(private http: Http, private authHttp: AuthHttp) {
  }

  getAllData(slug: string): Observable<CompetitionData[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.adminCompetitionUrl + slug + '/data/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getLearningData(slug: string): Observable<CompetitionData[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + slug + '/data/learning/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createCompetitionData(slug: string, competitionData: CompetitionData): Observable<CompetitionData> {
    let body = FData.toFormData(competitionData);
    return this.authHttp.post(this.adminCompetitionUrl + slug + '/data/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateCompetitionData(slug: string, competitionData: CompetitionData): Observable<CompetitionData> {
    let body = FData.toFormData(competitionData);
    return this.authHttp.put(this.adminCompetitionUrl + slug + '/data/' + competitionData.name + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteCompetitionData(slug: string, name: string): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.adminCompetitionUrl + slug + "/data/" + name + "/", options)
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
