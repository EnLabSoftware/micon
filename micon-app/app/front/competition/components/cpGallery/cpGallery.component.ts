import { Component } from '@angular/core';

import { CompetitionService } from '../../../../services'
import { Competition } from '../../../../models'

@Component({
  selector: 'cp-gallery',
  styles: [require('./cpGallery.scss')],
  template: require('./cpGallery.html'),
})

export class CompetitionGallery {

  competitions: Competition[];
  isLoading = false;

  constructor(protected service: CompetitionService) {}

  ngOnInit() {
    this.service.getCompetitionGallery().subscribe((data) => {
      this.competitions = data;
      this.isLoading = true;
    });
  }
}
