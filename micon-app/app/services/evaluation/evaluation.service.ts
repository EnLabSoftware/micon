import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { Evaluation } from '../../models';

@Injectable()
export class EvaluationService {
  private adminCompetitionUrl = 'api/v1/competitions/';

  constructor(private authHttp: AuthHttp) {
  }

  getEvaluations(slug: string): Observable<Evaluation[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.adminCompetitionUrl + slug + '/evaluations/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createEvaluation(slug: string, evaluation: Evaluation): Observable<Evaluation> {
    let body = FData.toFormData(evaluation);
    return this.authHttp.post(this.adminCompetitionUrl + slug + '/evaluations/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateEvaluation(slug: string, evaluation: Evaluation): Observable<Evaluation> {
    let body = FData.toFormData(evaluation);
    return this.authHttp.put(this.adminCompetitionUrl + slug + '/evaluations/' + evaluation.id + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteEvaluation(slug: string, id: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.adminCompetitionUrl + slug + "/evaluations/" + id + "/", options)
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
