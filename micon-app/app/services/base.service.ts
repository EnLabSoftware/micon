import { Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

export class BaseService {

  public static extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  public static handleError(error: any) {
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
