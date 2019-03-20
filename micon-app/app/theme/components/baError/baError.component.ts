import { Component, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'ba-error',
  template: require('./baError.html'),
  styles: [require('./baError.scss')],
  encapsulation: ViewEncapsulation.None
})
export class BaError {
  @Input() status:number = 500;
}

