import 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt/angular2-jwt'
import { Response, Headers, RequestOptions } from '@angular/http';

import { FData } from '../utils'
import { Competition, Payment } from '../../models'

@Injectable()
export class PaymentService {
  paymentsUrl = '/api/v1/payments/';
  payPalCreatePaymentUrl = '/payment/paypal/create-payment/';
  payPalExecutePaymentUrl = '/payment/paypal/execute-payment/';
  payPalReturnUrl = '/payment/paypal/return/';
  payPalCancelUrl = '/payment/paypal/cancel/';
  stripeCreatePaymentUrl = '/payment/stripe/create-payment/';

  constructor(private authHttp: AuthHttp) {
  }

  getPayments(): Observable<Payment[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.paymentsUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deletePayment(id: number): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.delete(this.paymentsUrl + id + "/", options)
      .map((res: Response) => {
        return res;
      })
      .catch(this.handleError);
  }

  payPalCreatePayment(competition: Competition): Observable<Response> {
    let body = FData.toFormData({
      slug: competition.slug,
      title: competition.title,
    });
    return this.authHttp.post(this.payPalCreatePaymentUrl, body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  payPalExecutePayment(competition: Competition, payerID: string, paymentToken: string): Observable<Response> {
    let body = FData.toFormData({
      slug: competition.slug,
      title: competition.title,
      paymentToken: paymentToken,
      payerID: payerID
    });
    return this.authHttp.post(this.payPalExecutePaymentUrl, body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  payPalReturn(competition: Competition, payerID: string, paymentToken: string): Observable<Response> {
    let body = FData.toFormData({
      slug: competition.slug,
      paymentToken: paymentToken,
      payerID: payerID
    });
    return this.authHttp.post(this.payPalReturnUrl, body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  stripeCreatePayment(competition: Competition, token: string): Observable<Response> {
    let body = FData.toFormData({
      slug: competition.slug,
      title: competition.title,
      paymentToken: token
    });
    return this.authHttp.post(this.stripeCreatePaymentUrl, body)
      .map(this.extractData)
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
