import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { JwtHelper,AuthHttp } from 'angular2-jwt/angular2-jwt';
import { SlideSetting, SiteSetting } from '../../models';
import { FData } from '../utils';


@Injectable()
export class CoreService {
  private settingsUrl = 'api/v1/settings/token/';
  site_settings: any;

  constructor(private http: Http, private jwtHelper: JwtHelper, public authHttp: AuthHttp) {
  }

  setLocalSettings(token: string) {
    localStorage.setItem('settings_token', token);
    this.site_settings = this.jwtHelper.decodeToken(token);
  }

  getAllSettings() {
    return this.site_settings;
  }

  getSetting(setting: string) {
    if (this.site_settings.hasOwnProperty(setting)) {
      return this.site_settings[setting];
    }
    return '';
  }

  getToken(): Observable<Response> {
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get(this.settingsUrl, options)
      .map((res: any) => {
        let data = res.json();
        this.setLocalSettings(data.token);
      })
      .catch(this.handleError);
  }

  getFrontSettings(){
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.http.get('api/v1/settings/front/token/', options)
      .map((res: any) => {
        let data = res.json();
        return this.jwtHelper.decodeToken(data)
      })
      .catch(this.handleError);
  }

  add_new_slide(slide_setting: SlideSetting): Observable<SlideSetting> {
    let body = FData.toFormData(slide_setting);
    return this.authHttp.post('api/v1/settings/front/add_slide/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  delete_slide(slide: SlideSetting): Observable<SlideSetting> {
    let body = FData.toFormData(slide);
    return this.authHttp.post('api/v1/settings/front/delete_slide/', body)
      .map(this.extractData)
      .catch(this.handleError);
  }

  getSiteSettings(){
    let headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let options = new RequestOptions({headers: headers, body: ""});
    return this.authHttp.get('api/v1/settings/site/', options)
      .map(this.extractData)
      .catch(this.handleError);
  }

  updateSiteSettings(siteSetting: SiteSetting): Observable<SiteSetting> {
    let body = FData.toFormData(siteSetting);
    return this.authHttp.post('api/v1/settings/site/', body)
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
