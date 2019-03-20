import { Component } from '@angular/core';
import { SiteSetting } from '../../../../models'
import { CoreService, MessageService } from '../../../../services'

@Component({
  selector: 'site-settings',
  styles: [require('./siteSettings.scss')],
  template: require('./siteSettings.html')
})
export class SiteSettings {
  public defaultLogo = '/static/images/no-image.png';
  public site_settings = new SiteSetting();

  constructor (private coreService: CoreService, private messageService: MessageService) {}

  ngOnInit() {
    this.coreService.getSiteSettings().subscribe(
      (data) => {
        console.log(data);
        this.site_settings = data
      },
      (errors) => {
        console.log(errors)
      }
    )
  }

  formSubmit(isValid: boolean) {
    if(isValid){
      this.coreService.updateSiteSettings(this.site_settings).subscribe(
        (data) => {
          this.messageService.infoMessage('Update site settings successful.')
        },
        (errors) => {
          this.messageService.errorMessage('An error has occur.')
        }
      )
    }
  }
}
