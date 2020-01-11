import { Component, HostListener } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { User } from '~/app/state/user';
import { Settings } from '~/app/state/settings';
import { locale } from '~/app/app.state';
import { ChangeLocale } from '~/app/state/settings';
import { Subscription } from 'rxjs';
import { Locale } from '~/app/state/settings/settings.state'
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ns-form-language',
  templateUrl: './form-language.component.html'
})
export class FormLanguageComponent {

  user: User;
  settings: Settings;
  currentLocale: Locale;
  private _subscriptions: Subscription[] = [];

  //  This *must* be here, not among imports like in other components.
  //  It's needed by PickerField, and therefore it must be within the component's 'this' context
  locales = require('~/app/assets/defaults.json').locales;

  constructor(
    private _store: Store<any>,
  ) { }

  @HostListener('loaded')
  pageInit() {

    this._subscriptions.push(
      this._store.pipe(
        select(locale),
        filter(x => !!x)
      ).subscribe((locale: Locale) => {
        this.currentLocale = locale;
      })
    );
  }

  changeLocale(event) {
    if (!event.object.selectedIndex) return;
    this._store.dispatch(new ChangeLocale(this.locales[event.object.selectedIndex]));
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

}
