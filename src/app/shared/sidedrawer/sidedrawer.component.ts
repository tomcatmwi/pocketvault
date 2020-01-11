import { Component, OnInit } from '@angular/core';
import { AppService } from '~/app/services/app.service';
import { Router } from '@angular/router';
import { distinctUntilKeyChanged, filter } from 'rxjs/operators';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import * as app from "tns-core-modules/application";
import { Store, select } from '@ngrx/store';
import { currentUser, vault } from '~/app/app.state';
import { User } from '~/app/state/user/user.state';
import { TranslateService } from '~/app/services/translate.service';
import { Page } from 'tns-core-modules/ui/page/page';

const defaults = require('~/app/assets/defaults.json');

export interface MenuItem {
  text: string,
  chevron?: boolean,
  icon: string,
  action: any;
}

@Component({
  selector: 'ns-sidedrawer',
  templateUrl: './sidedrawer.component.html'
})
export class SidedrawerComponent implements OnInit {

  //  Menu items (obviously)
  menuitems: MenuItem[] = [
    {
      text: 'menu.search',
      chevron: true,
      icon: 'fa-search',
      action: '/search'
    },
    {
      text: 'menu.help',
      chevron: true,
      icon: 'fa-question',
      action: '/help'
    },
    {
      text: 'menu.logout',
      chevron: true,
      icon: 'fa-sign-out-alt',
      action: () => this.logout()
    },
    {
      text: 'menu.settings',
      chevron: true,
      icon: 'fa-cog',
      action: '/settings'
    },
    {
      text: 'menu.exit',
      chevron: false,
      icon: 'fa-door-open',
      action: () => this._appService.exitApp()
    },
  ];

  isTablet: boolean = false;
  selected: number = -1;
  about = defaults.about;
  user: User;
  sideDrawer: RadSideDrawer;

  constructor(
    private _appService: AppService,
    private _router: Router,
    private _store: Store<any>,
    private _translateService: TranslateService,
    private _page: Page
  ) { }

  ngOnInit() {
    this.isTablet = this._appService.isTablet;

    //  Subscribe to user
    //  No need to unsubscribe, the side drawer persists until shutdown
    this._store.pipe(
      select(currentUser),
      distinctUntilKeyChanged('uid')
    ).subscribe(user => {
      this.user = user;

      //  If the user disappears, it means a logout - go to the login page then
      const noLogoutUrls = ['/', '/login', '/welcome'];
      if (!user.uid && noLogoutUrls.indexOf(this._router.url) === -1)
        this._router.navigate(['/login']);
    })
  }

  versionInfo() {
    this._appService.appVersion();
  }

  tapItem(i) {
    const item = this.menuitems[i];
    if (!item) return;

    this.selected = i;
    const sideDrawer = <RadSideDrawer>app.getRootView();
    setTimeout(() => this.selected = -1, 600);
    setTimeout(() => sideDrawer.closeDrawer(), 300);

    switch (typeof item.action) {
      case 'function': item.action.call(); break;
      case 'string': this._router.navigate([item.action]); break;
    }
  }

  logout() {
    const sideDrawer = <RadSideDrawer>app.getRootView();
    sideDrawer.closeDrawer();
    setTimeout(() => this._appService.logout(), 300);
  }

}
