import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { AppService } from '~/app/services/app.service';
import { Store, select } from '@ngrx/store';
import * as appSettings from 'tns-core-modules/application-settings';
import { Subscription } from 'rxjs';
import { locale } from '~/app/app.state';
import { Locale } from '~/app/state/settings/settings.state';
import { ChangeLocale } from '~/app/state/settings';

const locales = require('~/app/assets/defaults.json').locales;

export interface CarouselPage {
  title: string,
  text: string,
  image: string,
  allowLogin?: boolean
}

@Component({
  selector: 'ns-welcome',
  templateUrl: './welcome.component.html'
})
export class WelcomeComponent {

  //  Indicates the currently viewed page of the carousel
  currentPage = 1;

  //  Total number of pages
  maxPage = 4;

  //  Indicates that the page is currently sliding
  slide: boolean = false;

  //  Needed for *ngFor iteration
  pages = [];

  //  Is this a tablet?
  isTablet: boolean = false;

  //  Controls content and class of the two images
  image01 = { src: null, class: null }
  image02 = { src: null, class: null }

  locale: Locale;
  private _subscriptions: Subscription[] = [];

  constructor(
    private _router: Router,
    private _page: Page,
    private _appService: AppService,
    private _store: Store<any>
  ) { }

  @HostListener('loaded')
  pageInit() {

    //  AppSettings is kind of like localStorage, but supports various data types and a bit more versatile
    appSettings.setBoolean('notFirstRun', true);

    this._page.actionBarHidden = true;
    this._appService.sideDrawer = false;

    this.image01.src = 'welcome01.png';
    this.image02.src = 'welcome02.png';
    this.isTablet = this._appService.isTablet;
    this.pages = new Array(this.maxPage);

    this._subscriptions.push(
      this._store.pipe(select(locale)).subscribe(locale => this.locale = locale)
    );
  }

  changeLanguage(direction: 1 | -1) {
    let i = locales.findIndex(x => x.key === this.locale.key);
    i += direction;
    if (i > locales.length - 1) i = 0;
    if (i < 0) i = locales.length - 1;
    this._store.dispatch(new ChangeLocale(locales[i]));
  }

  swipe(event) {

    //  Don't swipe until finished previous one
    if (this.slide) return;

    //  Swiped left on the last or right on the first picture?
    if ((event.direction === 2 && this.currentPage >= this.maxPage) ||
      (event.direction === 1 && this.currentPage <= 1)) {

      this.image01.class = event.direction === 1 ? this.image01.class = 'out-to-left-and-back' : this.image01.class = 'out-to-right-and-back';
      this.image02.class = 'hidden';
      this.slide = true;

      setTimeout(() => {
        this.image01.class = null;
        this.image02.class = null;
        this.slide = false;
      }, 210);

      return;
    }

    //  Swipe left
    if (event.direction === 2)
      this.gotoPage(this.currentPage + 1);

    //  Swipe right
    if (event.direction === 1)
      this.gotoPage(this.currentPage - 1);
  }

  gotoPage(page) {

    //  Don't allow swipe until previous swipe finished
    if (this.slide) return;

    if (page === this.currentPage) return;

    if (page < this.currentPage) {
      this.image01.class = 'out-to-right';
      this.image02.class = 'in-from-left';
    } else {
      this.image01.class = 'out-to-left';
      this.image02.class = 'in-from-right';
    }

    this.image02.src = 'welcome0' + page + '.png',
      this.slide = true;
    this.currentPage = page;

    //  Reset classes after animation finishes and put the images back to where they have to be
    setTimeout(() => {
      this.image02.class = 'hidden';
      this.slide = false;

      this.image01 = {
        src: 'welcome0' + this.currentPage + '.png',
        class: null
      }
    }, 550);

  }

  gotoLogin() {
    this._router.navigate(['/login']);
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }


}
