import { Injectable } from '@angular/core';
import { Response, Headers, RequestOptions, Http } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { FData } from '../utils'

import { Prize } from '../../models';

@Injectable()
export class PrizeService {
  private adminCompetitionUrl = 'api/v1/competitions/';

  constructor(private authHttp: AuthHttp, private http: Http) {
  }

  getPrizes(slug: string): Observable<Prize[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.adminCompetitionUrl + slug + '/prizes/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  createPrize(slug: string, prize: Prize): Observable<Prize> {
    let body = FData.toFormData(prize);
    return this.authHttp.post(this.adminCompetitionUrl + slug + '/prizes/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateEvaluation(slug: string, prize: Prize): Observable<Prize> {
    let body = FData.toFormData(prize);
    return this.authHttp.put(this.adminCompetitionUrl + slug + '/prizes/' + prize.id + '/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteEvaluation(slug: string, id: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.adminCompetitionUrl + slug + "/prizes/" + id + "/", options)
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
