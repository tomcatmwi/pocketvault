import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { ToastyService } from './toasty.service';
import { TranslateService } from './translate.service';
import * as dialogs from "tns-core-modules/ui/dialogs";

const firebase = require("nativescript-plugin-firebase");

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {

  constructor(
    private _toastyService: ToastyService,
    private _translateService: TranslateService
  ) {
    this.init();
  }

  //  Initialize Firebase
  async init() {
    await from(firebase.init())
      .subscribe(
        res => { this._toastyService.toasty(this._translateService.translate('firebase.connected')); },
        err => { this._toastyService.toasty(this._translateService.translate('firebase.error') + err); }
      ).unsubscribe();
  }

  //  Log in to Firebase
  login(): Observable<any> {
    return Observable.create(observer => {
      firebase.login({ type: firebase.LoginType.GOOGLE })
        .then(
          res => observer.next(res),
          err => {
            setTimeout(() =>
              dialogs.alert({
                title: this._translateService.translate('general.error-title'),
                message: this._translateService.translate('firebase.login-error'),
                okButtonText: this._translateService.translate('general.ok-button')
              })
                .then(() => observer.error({ error: err })), 700
            )
          },
      );
    });
  }

  //  Log out from Firebase
  logout(): Observable<any> {
    return Observable.create(observer => {
      firebase.logout()
        .then(
          res => observer.next(res),
          err => setTimeout(() =>
            dialogs.alert({
              title: this._translateService.translate('general.error-title'),
              message: this._translateService.translate('firebase.logout-error'),
              okButtonText: this._translateService.translate('general.ok-button')
            })
              .then(() => observer.error({ error: err })), 700
          )
        );
    });
  }


}
