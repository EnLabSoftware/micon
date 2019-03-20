import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer,
} from '@angular/core';

import { CoreService } from '../../../../services'
import { Account } from '../../../../models'

@Component({
  selector: 'tp-comment',
  template: '<div id="disqus_thread"></div>',
  styles: [require('./tpComment.scss')],
})

export class TopicComment implements AfterViewInit, OnDestroy {

  @Input() public identifier: string;
  @Input() public shortname: string;
  @Input() public url: string;
  @Input() public categoryId: string;
  @Input() public title: string;
  @Input() public lang: string;

  /** Remove DISQUS script on destroy
   *  This is useful to let DISQUS change its theme according if the page background color changed.
   */
  @Input() public removeOnDestroy: boolean;

  public account: Account = new Account();
  public remote_auth_s3: string = '';
  public public_key: string = '';
  public isLoggedIn = false;

  constructor(private el: ElementRef, private renderer: Renderer, private coreService: CoreService) {
  }

  getAccountConfig() {
    console.log(this.coreService.getAllSettings());
    this.shortname = this.coreService.getSetting('DISQUS_SHORTNAME');
    this.remote_auth_s3 = this.coreService.getSetting('DISQUS_SSO');
    this.public_key = this.coreService.getSetting('DISQUS_PUBLIC_KEY');
  }

  ngAfterViewInit() {
    this.getAccountConfig();

    if ((<any>window).DISQUS === undefined) {
      this.addScriptTag();
    }
    else {
      this.reset();
    }
  }

  /**
   * Reset disqus with new inputs.
   */
  reset() {
    (<any>window).DISQUS.reset({
      reload: true,
      config: this.getConfig()
    });
  }

  /**
   * Add disqus script to the document.
   */
  addScriptTag() {
    (<any>window).disqus_config = this.getConfig();

    let script = this.renderer.createElement(this.el.nativeElement, 'script');
    script.src = `http://${this.shortname}.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());
  }

  /**
   * Get disqus config
   */
  getConfig() {
    let _self = this;
    return function () {
      this.page.url = _self.url || window.location.href;
      this.page.identifier = _self.identifier;
      this.page.category_id = _self.categoryId;
      this.page.title = _self.title || document.title;
      this.language = _self.lang;
       // The generated payload which authenticates users with Disqus
      this.page.remote_auth_s3 = _self.remote_auth_s3;
      this.page.api_key = _self.public_key;
      // This adds the custom login/logout functionality
      // this.sso = {
      //   name: "Login with Hivecon",
      //   button: "https://a.disquscdn.com/dotcom/d-2407bda/img/brand/disqus-social-icon-blue-white.svg",
      //   icon: "http://www.hivecon.io/static/app/assets/icon/favicon-16x16.png",
      //   url: "http://micon.dev:8888/login",
      //   logout: "http://micon.dev:8888/logout",
      //   width: "800",
      //   height: "400"
      // };
    };
  }

  ngOnDestroy() {
    if(this.removeOnDestroy){
      (<any>window).DISQUS = undefined;
    }
  }

}
