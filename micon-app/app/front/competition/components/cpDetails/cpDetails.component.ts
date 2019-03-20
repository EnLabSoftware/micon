import { Component, Input } from '@angular/core';
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-details',
  template: require('./cpDetails.html'),
})

export class CompetitionDetails {
  @Input() competition:Competition;
}
