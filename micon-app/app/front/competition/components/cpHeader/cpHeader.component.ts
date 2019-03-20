import { Component, Input } from '@angular/core';

import { Competition } from '../../../../models'

@Component({
  selector: 'cp-header',
  styles: [require('./cpHeader.scss')],
  template: require('./cpHeader.html'),
})

export class CompetitionHeader {

  @Input() competition:Competition;
  primary = 'primary';
  warn = 'warn';

  constructor() {}
}
