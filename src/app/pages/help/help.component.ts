import { Component, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { localeString } from '~/app/app.state';
import { AppService } from '~/app/services/app.service';

@Component({
  selector: 'ns-help',
  templateUrl: './help.component.html'
})
export class HelpComponent {

  help: string;
  pageIndex: number = 0;
  private _subscriptions: Subscription[] = [];
  buttons = ['help', 'privacy'];
  language: string;

  constructor(
    private _location: Location,
    private _store: Store<any>,
    private _appService: AppService,
  ) { }

  @HostListener('loaded')
  pageInit() {
    this._appService.sideDrawer = false;
    this._subscriptions.push(
      this._store.select(localeString).subscribe(ls => {
        this.language = ls;
        this.changePage(this.pageIndex);
      })
    );
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  changePage(index) {
    this.pageIndex = index;
    this.help = require(`~/app/assets/${this.buttons[this.pageIndex]}/${this.language}.html`);
  }

  goBack() {
    this._location.back();
  }

  versionInfo() {
    this._appService.appVersion();
  }

}
