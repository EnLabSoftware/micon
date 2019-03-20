import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import { AuthHttp, tokenNotExpired, JwtHelper } from 'angular2-jwt/angular2-jwt';
import { FData } from '../utils';

import { Account } from '../../models';

@Injectable()
export class AccountService {
  private accountsUrl = 'api/v1/accounts/';
  private loginUrl = 'api/v1/auth/login/';
  private logoutUrl = 'api/v1/auth/logout/';
  private isLoggedInSource = new Subject<boolean>();
  account = new Account();

  isLoggedIn$ = this.isLoggedInSource.asObservable();

  constructor(private http: Http,
              public authHttp: AuthHttp,
              private jwtHelper: JwtHelper) {
  }
  // Observable string sources
  private missionAnnouncedSource = new Subject<string>();
  // Observable string streams
  missionAnnounced$ = this.missionAnnouncedSource.asObservable();
  // Service message commands
  announceMission(mission: string) {
    this.missionAnnouncedSource.next(mission);
  }

  loggedIn() {
    return tokenNotExpired();
  }

  createAuthorizationHeader(headers: Headers) {
    if (this.getToken())
      headers.append('Authorization', 'Bearer ' + this.getToken());
  }

  updateLoginStatus(status: boolean) {
    this.isLoggedInSource.next(status);
  }

  login(username: string, password: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let body = JSON.stringify({username, password});
    let options = new RequestOptions({headers: headers});
    return this.http.post(this.loginUrl, body, options)
      .map((res: any) => {
        let data = res.json();
        this.updateLoginStatus(true);
        this.setLocalAccount(data.token);
      })
      .catch(this.handleError);
  }

  social_login(social_type:string, access_token: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let body = JSON.stringify({access_token});
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/'+ social_type +'/', body, options)
      .map((res: any) => {
        let data = res.json();
        this.updateLoginStatus(true);
        this.setLocalAccount(data.token);
      })
      .catch(this.handleError);
  }

  getToken(): string {
    return localStorage.getItem('id_token') || '';
  }

  setLocalAccount(token: string) {
    localStorage.setItem('id_token', token);
    this.account = this.jwtHelper.decodeToken(token);
  }

  getLocalAccount(): any {
    let token = this.getToken();
    if (token) {
      this.account = this.jwtHelper.decodeToken(token);
    }
    return this.account;
  }

  loggedInAccountUserName() {
    if (this.loggedIn()) {
      let token = localStorage.getItem('id_token');
      token = this.jwtHelper.decodeToken(token);
      if (token.hasOwnProperty('username')) {
        return token['username'];
      }
    }
    return false;
  }

  logout() {
    return this.authHttp.get(this.logoutUrl)
      .map((res: any) => {
        localStorage.removeItem('id_token');
        this.updateLoginStatus(false);
        return res;
      })
      .catch(this.handleError);
  }

  getAccounts(): Observable<Account[]> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.accountsUrl, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getAccount(username: string): Observable<Account> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get(this.accountsUrl + username + "/", options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  changePassword(old_password:string, new_password1: string, new_password2: string): Observable<Account> {
    let body = JSON.stringify({ old_password, new_password1 , new_password2 });
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.authHttp.post('api/v1/auth/password/change/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateAvatar(account: Account): Observable<Account> {
    let body = FData.toFormData(account);
    return this.authHttp.put(this.accountsUrl + account.username + "/avatar/", body)
      .map((res: any) => {
        let token = res.json();
        this.setLocalAccount(token);
        return this.account
      })
      .catch(this.handleError);
  }

  updateInfo(account: Account): Observable<Account> {
    let body = FData.toFormData(account);
    return this.authHttp.put(this.accountsUrl + account.username + "/info/", body)
      .map((res: any) => {
        let token = res.json();
        this.setLocalAccount(token);
      })
      .catch(this.handleError);
  }

  createAccount(username: string, email: string, password1: string, password2: string): Observable<Account> {
    let body = JSON.stringify({username, email, password1, password2});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/registration/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  resetPassword(email: string): Observable<Account> {
    let body = JSON.stringify({email});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/password/reset/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  confirm_resetPassword(new_password1: string, new_password2: string, uid: string, token:string): Observable<Account> {
    let body = JSON.stringify({new_password1, new_password2, uid, token});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/password/reset/confirm/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  verify_email(key: string) {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get('accounts/confirm-email/' + key + "/", options)
      .map((res: any) => {
        return res || {};
      })
      .catch(this.handleError);
  }

  is_verified_email(username: string){
    let body = JSON.stringify({username});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/is_verified_email/' + username + "/", body, options)
      .map(this.extractData)
      .catch(this.handleError)
  }

  log_user_in(username: string){
    let body = JSON.stringify({username});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/log_user_in', body, options)
      .map((res: any) => {
        let data = res.json();
        this.updateLoginStatus(true);
        this.setLocalAccount(data);
      })
      .catch(this.handleError);
  }

  username_validation(username: string): Observable<Account> {
    let body = JSON.stringify({username});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/validation/username/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  username_email(email: string): Observable<Account> {
    let body = JSON.stringify({email});
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers});
    return this.http.post('api/v1/auth/validation/email/', body, options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  activeAccount(account: Account): Observable<Response> {
    let body = FData.toFormData(account);
    return this.authHttp.put(this.accountsUrl + account.username + "/active/", body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  deleteAccount(account: Account): Observable<Response> {
    let body = FData.toFormData(account);
    return this.authHttp.delete(this.accountsUrl + account.username + "/delete/", body)
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
