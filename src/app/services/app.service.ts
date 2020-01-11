import { Injectable } from '@angular/core';
import { TranslateService } from '~/app/services/translate.service';
import { Frame } from 'tns-core-modules/ui/frame';
import { exit } from 'nativescript-exit';
import { screen, isAndroid, isIOS } from "tns-core-modules/platform";
import { ToastyService } from '~/app/services/toasty.service';
import { BehaviorSubject } from 'rxjs';
import * as clipboard from "nativescript-clipboard";
import * as application from 'tns-core-modules/application'
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as platform from 'tns-core-modules/platform';
import * as appversion from "nativescript-appversion";
import { Store } from '@ngrx/store';
import { Clear } from '~/app/state/vault/vault.actions';
import { ChangeMasterPass, ChangeCipher } from '~/app/state/settings/settings.actions';
import { Logout } from '~/app/state/user/user.actions';

export interface VersionInfo {
  appId: string;
  versionName: string;
  versionCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private _sideDrawerEnabled: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private _translateService: TranslateService,
    private _toastyService: ToastyService,
    private _store: Store<any>
  ) {
    if (isAndroid) this._backButton();
  }

  //  Watch back button tap, send event notification to the current page
  //  This is run once when the service (and the app) is created
  private _backButton() {
    application.android.on(application.AndroidApplication.activityBackPressedEvent,
      (args: application.AndroidActivityBackPressedEventData) => {
        if (this.currentView.hasListeners('BackButton')) {
          args.cancel = true;

          //  prevents the event from firing multiple times
          this.currentView.notify({
            eventName: 'BackButton',
            object: this.currentView
          });
        } else {
          args.cancel = false;
        }
      });
  }

  set sideDrawer(value: boolean) {
    this._sideDrawerEnabled.next(value);
  }

  get sideDrawerEnabled(): BehaviorSubject<boolean> {
    return this._sideDrawerEnabled;
  }

  get currentView() {
    return Frame.topmost().currentPage;
  }

  get isTablet() {
    return platform.device.deviceType === 'Tablet';
  }

  get isAndroid() {
    return isAndroid;
  }

  get isIOS() {
    return isIOS;
  }

  get screen() {
    return {
      widthDIPs: screen.mainScreen.widthDIPs,
      heightDIPs: screen.mainScreen.heightDIPs,
      widthPixels: screen.mainScreen.widthPixels,
      heightPixels: screen.mainScreen.heightPixels
    }
  }

  appVersion() {

    const versionInfo = {
      appId: null,
      versionName: null,
      versionCode: null,
    }

    Promise.all([
      appversion.getAppId(),
      appversion.getVersionName(),
      appversion.getVersionName()
    ]).then(values => {
      Object.keys(versionInfo).forEach((key, i) => {
        versionInfo[key] = values[i];
      });

      dialogs.alert({
        title: this._translateService.translate('version.version-title'),
        message: `${this._translateService.translate('version.app-id')}: ${versionInfo.appId}\n${this._translateService.translate('version.version-name')}: ${versionInfo.versionName}\n${this._translateService.translate('version.version-code')}: ${versionInfo.versionCode}`,
        okButtonText: this._translateService.translate('general.ok-button')
      });

    });

  }

  logout() {
    dialogs.confirm({
      title: this._translateService.translate('general.logout-title'),
      message: this._translateService.translate('general.logout'),
      okButtonText: this._translateService.translate('general.yes-button'),
      cancelButtonText: this._translateService.translate('general.no-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new Clear());
      this._store.dispatch(new ChangeMasterPass(null));
      this._store.dispatch(new ChangeCipher(null));
      this._store.dispatch(new Logout());
    });
  }

  exitApp() {
    const confirm = {
      title: this._translateService.translate('general.button-exit-app'),
      message: this._translateService.translate('general.exit-app-question'),
      okButtonText: this._translateService.translate('general.ok-button'),
      cancelButtonText: this._translateService.translate('general.cancel-button')
    };
    dialogs.confirm(confirm).then(res => { if (res) exit(); });
  }

  copyToClipboard(content: string) {
    clipboard.setText(content).then(() => {
      this._toastyService.toasty(this._translateService.translate('general.clipboard-copied'));
    });
  }

}
