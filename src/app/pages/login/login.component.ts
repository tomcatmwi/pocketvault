import { Component, ViewContainerRef, HostListener } from '@angular/core';
import { Page } from "tns-core-modules/ui/page";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, distinctUntilKeyChanged, tap, filter } from 'rxjs/operators';
import { registerElement } from 'nativescript-angular/element-registry';
import { Store, select } from '@ngrx/store';
import { Login, Logout, User } from '~/app/state/user';
import { Load, Clear, Decrypt, GenerateDemo, Empty } from '~/app/state/vault';
import { Settings, ChangeCipher, ChangeMasterPass } from '~/app/state/settings';
import { currentUser, settings } from '~/app/app.state';
import { vault } from '~/app/app.state';
import { MasterPasswordComponent } from '~/app/modals/master-password/master-password.component';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { CardView } from '@nstudio/nativescript-cardview';
import { AppService } from '~/app/services/app.service';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { TranslateService } from '~/app/services/translate.service';

registerElement('CardView', () => CardView);

@Component({
  selector: 'ns-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  public user: User;
  public settings: Settings;
  public spinner: boolean = false;
  public vaultReady: boolean = false;
  public isTablet: boolean = false;

  private _subscriptions: Subscription[] = [];
  private _vaultEmpty: boolean = false;

  constructor(
    public router: Router,
    private _store: Store<any>,
    private _page: Page,
    private _modalService: ModalDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _appService: AppService,
    private _translateService: TranslateService
  ) { }

  @HostListener('loaded')
  pageInit() {
    this._page.actionBarHidden = true;
    this.isTablet = this._appService.isTablet;
    this._appService.sideDrawer = false;

    //  Android hardware Back button listener - see app.service
    this._initBackButton();

    //  Subscribe to settings
    this._subscriptions.push(
      this._store.pipe(
        select(settings),
        distinctUntilChanged()
      ).subscribe(settings => {
        this.settings = settings;
      })
    );

    //  Subscribe to user
    this._subscriptions.push(
      this._store.pipe(
        select(currentUser),
        tap(() => this.spinner = false),
        distinctUntilKeyChanged('uid')
      ).subscribe(user => {

        //  Successful login - get the state from the cloud
        if (user.uid) {
          this._store.dispatch(new Load(user));
          this.spinner = false;
        }

        //  No user - then clear the Vault
        else
          this._store.dispatch(new Clear());

        this.user = user;
      })
    );

    //  Subscribe to vault changes
    this._subscriptions.push(
      this._store.pipe(
        select(vault),
        filter(() => !!this.user.uid && !!this.settings),
        distinctUntilKeyChanged('unlockAttempts'),
        tap(x => {
          this.vaultReady = (x.loaded && x.decrypted);
          this._vaultEmpty = !x.data;
          if (this.vaultReady) this.spinner = false;
        }),
        filter(x => x.loaded && !x.decrypted),
      )
        .subscribe(vault => {

          //  turn off event listener so it won't get triggered if the user
          //  taps the Back button on the modal
          this._deinitBackButton();

          const options: ModalDialogOptions = {
            viewContainerRef: this._viewContainerRef,
            fullscreen: true,
            context: {
              masterPassword: !!this.settings.masterPassword,
              cipher: this.settings.cipher,
              gotVault: !!vault.data
            }
          };

          this._modalService.showModal(MasterPasswordComponent, options)
            .then(res => {
              this.spinner = true;

              //  turn listener back on
              this._initBackButton();

              //  user hit cancel, forget and log out
              if (!res) {
                this.logout();
                return;
              }

              this._store.dispatch(new ChangeMasterPass(res.masterPassword));
              this._store.dispatch(new ChangeCipher(res.cipher));

              this._store.dispatch(new Decrypt({
                vault: vault,
                masterPassword: res.masterPassword,
                cipher: res.cipher
              }));
            });

        })
    );
  }

  //  Log in
  login() {
    this.spinner = true;
    this._store.dispatch(new Clear());
    this._store.dispatch(new Login());
  }

  //  Log out
  logout() {
    this.spinner = true;
    this._store.dispatch(new Clear());
    this._store.dispatch(new ChangeMasterPass(null));
    this._store.dispatch(new ChangeCipher(null));
    this._store.dispatch(new Logout());
    this.spinner = false;
  }

  gotoMain() {

    if (!this.vaultReady) return;

    //  If the vault is empty, generate demo database
    //  By this time the user must've selected the language

    new Promise((resolve, reject) => {
      if (this._vaultEmpty)
        dialogs.confirm({
          title: this._translateService.translate('login.confirm-demo-title'),
          message: this._translateService.translate('login.confirm-demo'),
          okButtonText: this._translateService.translate('general.yes-button'),
          cancelButtonText: this._translateService.translate('general.no-button')
        }).then(res => {
          if (!res)
            this._store.dispatch(new Empty());
          else
            this._store.dispatch(new GenerateDemo());
          resolve();
        })
      else
        resolve();
    })
      .then(() => {
        this.router.navigate(['/main']);
      });
  }

  private _initBackButton() {
    if (this._appService.isAndroid)
      this._page.on('BackButton', () => this._appService.exitApp(), this);
  }

  private _deinitBackButton() {
    if (this._appService.isAndroid)
      this._page.off('BackButton');
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._deinitBackButton();
    this._subscriptions.forEach(s => s.unsubscribe());
  }

}
