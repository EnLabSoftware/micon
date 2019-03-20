import { Component, ViewEncapsulation } from '@angular/core';
import { Subscription }   from 'rxjs/Subscription';
import { GlobalState } from '../../../global.state';
import { AccountService } from '../../../services';
import { Account } from '../../../models';


@Component({
  selector: 'ba-page-top',
  styles: [require('./baPageTop.scss')],
  template: require('./baPageTop.html'),
  encapsulation: ViewEncapsulation.None
})
export class BaPageTop {
  public isLoggedIn = false;
  public subscription: Subscription;
  public isScrolled:boolean = false;
  public isMenuCollapsed:boolean = false;
  account = new Account();

  constructor(private _state:GlobalState, private accountService: AccountService) {
    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.accountService.loggedIn();
    this.subscription = this.accountService.isLoggedIn$.subscribe(
      status => {
          this.isLoggedIn = status;
    });
    if(this.isLoggedIn){
      this.account = this.accountService.getLocalAccount();
    }
  }

  public toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
    this._state.notifyDataChanged('menu.isCollapsed', this.isMenuCollapsed);
  }

  public scrolledChanged(isScrolled) {
    this.isScrolled = isScrolled;
  }
}
