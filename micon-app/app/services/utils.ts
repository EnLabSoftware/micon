import { isUndefined } from "util";

class Data {
  toFormData(values: any): FormData {
    let body = new FormData();
    Object.keys(values).forEach(key => {
      if (values.hasOwnProperty(key) && !isUndefined(values[key])) {
        if (values[key] instanceof Array) {
          for (let i=0; i<values[key].length; i++) {
            if(values[key] instanceof File) {
              body.append(key, values[key][i], values[key][i].name);
            } else {
              body.append(key, values[key][i]);
            }
          }
        } else {
          body.append(key, values[key]);
        }
      }
    });
    return body;
  }
}

export const FData = new Data();
