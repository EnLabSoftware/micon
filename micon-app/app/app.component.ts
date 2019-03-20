import './app.loader.ts';
import { Component, ViewEncapsulation } from '@angular/core';
import { GlobalState } from './global.state';
import { BaThemePreloader, BaThemeSpinner } from './theme/services';
import { CoreService } from './services'

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styles: [require('normalize.css'), require('./app.scss')],
  template: `
    <main [ngClass]="{'menu-collapsed': isMenuCollapsed}" baThemeRun>
      <div class="additional-bg"></div>
      <router-outlet></router-outlet>
    </main>
  `
})
export class App {

  isMenuCollapsed: boolean = false;
  error: any;

  constructor(private _state: GlobalState,
              private _spinner: BaThemeSpinner,
              private coreService: CoreService) {

    // this._loadImages();

    this._state.subscribe('menu.isCollapsed', (isCollapsed) => {
      this.isMenuCollapsed = isCollapsed;
    });
  }

  public ngOnInit(): void {
    this.coreService.getToken().subscribe(
      res => {
        //console.log(res);
        //console.log(this.coreService.getAllSettings())
      },
      error => {
        this.error = error;
        // console.log(error);
      });
  }

  public ngAfterViewInit(): void {
    // hide spinner once all loaders are completed
    BaThemePreloader.load().then((values) => {
      this._spinner.hide();
    });
  }
}
