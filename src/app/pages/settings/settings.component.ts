import { Component, ViewContainerRef, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { TranslateService } from '~/app/services/translate.service';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { Store, select } from '@ngrx/store';
import { Empty } from '~/app/state/vault';
import { ToastyService } from '~/app/services/toasty.service';
import { VaultCollection } from '~/app/state/vault/vault.state';
import { Subscription } from 'rxjs';
import { vault, locale, settings } from '~/app/app.state';
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { Page } from 'tns-core-modules/ui/page/page';
import { MasterPasswordComponent } from '~/app/modals/master-password/master-password.component';
import { Settings, ChangeMasterPass, ChangeCipher } from '~/app/state/settings';
import { Export, DeleteExport, Save } from '~/app/state/vault';
import { AppService } from '~/app/services/app.service';

@Component({
  selector: 'ns-settings',
  templateUrl: './settings.component.html'
})
export class SettingsComponent {

  //  Menu items
  items = [
    'settings.menu.change-cipher',
    'settings.menu.export-text',
    'settings.menu.export-json',
    'settings.menu.delete-exports',
    'settings.menu.clear-vault'
  ];

  private _vault: string | VaultCollection[];
  private _subscriptions: Subscription[] = [];
  private _dateFormat: string;
  private _settings: Settings;

  constructor(private _location: Location,
    private _translateService: TranslateService,
    private _store: Store<any>,
    private _appService: AppService,
    private _viewContainerRef: ViewContainerRef,
    private _modalService: ModalDialogService,
    private _toastyService: ToastyService) { }

  @HostListener('loaded')
  pageInit() {

    this._appService.sideDrawer = false;

    //  Load vault
    this._subscriptions.push(
      this._store.pipe(select(vault)).subscribe(vault => this._vault = vault.data)
    );

    //  Get date format from current locale
    this._subscriptions.push(
      this._store.pipe(select(locale)).subscribe(locale => this._dateFormat = locale.dateFormat)
    );

    //  Get current settings
    this._subscriptions.push(
      this._store.pipe(select(settings)).subscribe(settings => { this._settings = settings })
    );
  }

  tapSetting(i) {
    switch (i) {
      case 0: this._changePass(); break;
      case 1: this._export('txt', 'text'); break;
      case 2: this._export('json', 'JSON'); break;
      case 3: this._deleteExport(); break;
      case 4: this._clearVault(); break;
    }
  }

  private _changePass() {

    const options: ModalDialogOptions = {
      viewContainerRef: this._viewContainerRef,
      fullscreen: true,
      context: {
        masterPassword: this._settings.masterPassword,
        cipher: this._settings.cipher,
        gotVault: true,
        modifyPass: true
      }
    };

    this._modalService.showModal(MasterPasswordComponent, options)
      .then(res => {
        if (!res) return;

        if (res.masterPassword !== this._settings.masterPassword)
          this._store.dispatch(new ChangeMasterPass(res.masterPassword));

        if (res.cipher !== this._settings.cipher)
          this._store.dispatch(new ChangeCipher(res.cipher));

        this._store.dispatch(new Save());

        this._toastyService.toasty(this._translateService.translate('settings.values-changed'));
      });
  }

  private _export(format: string, nice: string) {

    dialogs.confirm({
      title: this._translateService.translate('settings.save-vault-title'),
      message: this._translateService.translate('settings.save-vault', { format: nice }),
      okButtonText: this._translateService.translate('general.ok-button'),
      cancelButtonText: this._translateService.translate('general.cancel-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new Export(format));
    });
  }

  private _deleteExport() {

    dialogs.confirm({
      title: this._translateService.translate('settings.delete-exports-title'),
      message: this._translateService.translate('settings.delete-exports'),
      okButtonText: this._translateService.translate('general.ok-button'),
      cancelButtonText: this._translateService.translate('general.cancel-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new DeleteExport());
    });
  }

  private _clearVault() {

    dialogs.confirm({
      title: this._translateService.translate('settings.clear-vault-title'),
      message: this._translateService.translate('settings.clear-vault'),
      okButtonText: this._translateService.translate('general.yes-button'),
      cancelButtonText: this._translateService.translate('general.no-button')
    }).then(res => {
      if (!res) return;
      this._store.dispatch(new Empty());
      this._toastyService.toasty(this._translateService.translate('settings.vault-cleared'));
    });

  }

  goBack() {
    this._location.back();
  }

  @HostListener('unloaded')
  pageDestroy() {
    this._subscriptions.forEach(s => s.unsubscribe());
  }

}
