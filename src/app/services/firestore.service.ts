import { Injectable } from '@angular/core';
import { exit } from 'nativescript-exit';
import { Folder, File } from "tns-core-modules/file-system";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { Vault } from '~/app/state/vault';
import { ChangeLocale, ChangeMasterPass, ChangeCipher, Settings } from '~/app/state/settings';
import { ToastyService } from './toasty.service';
import { TranslateService } from './translate.service';
import { SavedVault, VaultCollection } from '~/app/state/vault/vault.state';
import * as appSettings from 'tns-core-modules/application-settings';

import * as fs from "tns-core-modules/file-system";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { User } from '~/app/state/user';

const CryptoJS = require("crypto-js");
const firebase = require('nativescript-plugin-firebase/app');
const defaults = require('~/app/assets/defaults.json');

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  //  Standard Firebase error messages
  errorMessages = [
    { code: -13011, key: 'ERROR_BUCKET_NOT_FOUND', message: null },
    { code: -13040, key: 'ERROR_CANCELED', message: null },
    { code: -13031, key: 'ERROR_INVALID_CHECKSUM', message: null },
    { code: -13020, key: 'ERROR_NOT_AUTHENTICATED', message: null },
    { code: -13021, key: 'ERROR_NOT_AUTHORIZED', message: null },
    { code: -13010, key: 'ERROR_OBJECT_NOT_FOUND', message: null },
    { code: -13012, key: 'ERROR_PROJECT_NOT_FOUND', message: null },
    { code: -13013, key: 'ERROR_QUOTA_EXCEEDED', message: null },
    { code: -13030, key: 'ERROR_RETRY_LIMIT_EXCEEDED', message: null },
    { code: -13000, key: 'ERROR_UNKNOWN', message: null },
  ];

  targetDir: Folder;
  temp: string;
  folder: Folder;
  file: File;

  constructor(
    private _store: Store<any>,
    private _toastyService: ToastyService,
    private _translateService: TranslateService
  ) {

    //  Translate Firestore error messages
    this.errorMessages.forEach(x => x.message = 'firebase.' + x.key);
    this.errorMessages = this._translateService.translateBatch(this.errorMessages, null, 'message');

    //  Set path & filename for temporary files from Firestore
    this.targetDir = fs.knownFolders.temp();
    this.temp = this.targetDir.path + '/pocketvault/pocketvault.json';
    this.folder = this.targetDir.getFolder('pocketvault');
    this.file = this.folder.getFile('pocketvault.json');
  }

  private _errorMessage(code: number = -13000): string {
    return (this.errorMessages.find(x => x.code === code) || this.errorMessages.find(x => x.code === -13000)).message;
  }

  //  Loads the state from the cloud
  loadVault(user: User) {
    const ref = firebase.storage().ref().child(user.uid + '/pocketvault.json');

    return Observable.create(observer => {

      //  Attempt to load saved & encrypted state from Firebase
      ref.download(this.temp)
        .then(() => {
          this._toastyService.toasty(this._translateService.translate('firebase.vault-loaded'));
        })
        .catch(error => {

          //  nativescript-plugin-firebase currently returns error message strings and no codes,
          //  so this will not run for the time being unless you modify the plugin to return 
          //  the exception object
          if (typeof error.getErrorCode() !== 'undefined') {
            const errorCode = error.getErrorCode();
            if (errorCode !== -13010) {
              dialogs.alert({
                title: this._translateService.translate('firebase.cloud-error'),
                message: `${errorCode} ${this._errorMessage(errorCode)}`,
                okButtonText: this._translateService.translate('general.exit')
              }).then(() => exit());
            }
          }

          //  The user may have a short language code (ie. "en" instead if "en-US")
          let locale = user.locale;
          if (locale.length !== 5)
            locale = defaults.locales.find(x => x.id === locale).key;

          //  If the encrypted vault can't be downloaded, generate a new vault
          const vault: SavedVault = {
            userid: user.uid,
            language: locale || 'en-US',
            cipher: 'AES',
            lastsave: new Date().getTime(),
            vault: ''
          };

          //  Load last selected language from app settings if possible
          //  This overrides the user's language settings in the Google account 
          if (appSettings.hasKey('language'))
            vault.language = appSettings.getString('language');

          this.file.writeTextSync(JSON.stringify(vault, null, 2));
          this._toastyService.toasty(this._translateService.translate('firebase.new-vault'));
        })
        .finally(() => {

          //  Attempt to read saved temp file
          this.file.readText()
            .then(res => {

              //  Check if it's proper JSON
              let loadedVault: SavedVault = null;
              try {
                loadedVault = JSON.parse(res);
              } catch (error) {
                this._toastyService.toasty(this._translateService.translate('firebase.vault-error'));
                observer.error({ error: error });
              }

              //  Delete temp file
              this.file.removeSync();

              //  Return null if there was an error
              if (!loadedVault) return null;

              //  Update settings according to loaded state
              this._store.dispatch(new ChangeLocale(defaults.locales.find(x => x.key === loadedVault.language)));
              this._store.dispatch(new ChangeCipher(loadedVault.cipher));

              //  Return loaded data
              observer.next({ data: loadedVault.vault, decrypted: loadedVault.cipher === 'NONE' });
            })
            .catch(error => {
              observer.error({ error: error });
            });
        });

    });
  }

  //  Gets the sample vault from defaults.json and translates it to the current language
  generateDemo(): Observable<VaultCollection[]> {

    //  Recursive inner function to do the generation
    const translate = (collection) => {
      if (collection.name)
        collection.name = this._translateService.translate(collection.name);

      if (collection.items)
        collection.items.forEach(item => {
          item.id = Math.random().toString(36).substring(8);
          item.name = this._translateService.translate(item.name);
          if (item.comment) item.comment = this._translateService.translate(item.comment);
          item.created = new Date().getTime();
          item.lastModified = new Date().getTime();
        });

      if (collection.collections)
        collection.collections.forEach(subcollection => {
          subcollection.id = Math.random().toString(36).substring(8);
          subcollection.created = new Date().getTime();
          translate(subcollection);
        });
      return collection;
    }

    return new Observable(observer => observer.next(translate(defaults.sampleVault)));
  }

  //  Decrypts the loaded vault
  //  lastsave is needed to update old vaults
  decryptVault(vault, masterPassword, cipher): Observable<Vault | Error> {

    this._store.dispatch(new ChangeCipher(cipher));

    //  if the vault is empty, there's no need to generate anything
    if (!vault.data)
      vault.decrypted = true;

    return Observable.create(observer => {

      //  if it's not encrypted...
      if (!vault.data || vault.decrypted || cipher === 'NONE')
        observer.next({ data: this._fixVault(vault.data), decrypted: true })

      //  decrypt
      else
        try {
          let temp = JSON.parse(CryptoJS[cipher].decrypt(vault.data, masterPassword).toString(CryptoJS.enc.Utf8));
          this._toastyService.toasty(this._translateService.translate('firebase.vault-decrypted'));
          this._store.dispatch(new ChangeMasterPass(masterPassword));
          temp = this._fixVault(temp);
          observer.next({ data: this._fixVault(temp), decrypted: true });
        } catch (error) {
          dialogs.alert({
            title: this._translateService.translate('firebase.vault-decrypt-error-title'),
            message: this._translateService.translate('firebase.vault-decrypt-error'),
            okButtonText: this._translateService.translate('general.ok-button')
          }).then(() => {
            observer.error({ error: error });
          });
        }
    });
  }

  //  Encrypts and saves the current vault in the cloud
  saveVault(user: User, settings: Settings, vault: VaultCollection[]): Observable<any> {

    const savedVault: SavedVault = {
      userid: user.uid,
      language: settings.locale.key,
      cipher: settings.cipher,
      lastsave: new Date().getTime(),
      vault: settings.cipher === 'NONE' ? vault : CryptoJS[settings.cipher].encrypt(JSON.stringify(vault), settings.masterPassword).toString()
    };

    //  Save into local temp file
    this.file.writeTextSync(JSON.stringify(savedVault, null, 2));

    //  Upload file into cloud
    const ref = firebase.storage().ref().child(user.uid + '/pocketvault.json');

    const metadata = {
      contentType: "application/json",
      contentLanguage: settings.locale.id
    }

    return Observable.create(observer => {

      // console.log('*** SAVING IS DISABLED ***');
      // this._toastyService.toasty('*** SAVING IS DISABLED ***');
      // observer.next(null);
      // return;

      const path = fs.knownFolders.temp().path + '/pocketvault/pocketvault.json';
      ref.put(fs.File.fromPath(path), metadata)
        .then(
          () => {
            this._toastyService.toasty(this._translateService.translate('firestore.save-successful'));
            this.file.removeSync();
            observer.next(null);
          },
          error => {
            dialogs.alert({
              title: this._translateService.translate('general.error-title'),
              message: this._translateService.translate('firestore.save-error', { error }),
              okButtonText: this._translateService.translate('general.ok-button')
            }).then(() => {
              this.file.removeSync();
              observer.next(null)
            });
          });

    });
  }

  //  This is needed to fix vaults generated with the first beta version of the app
  //  Adds class field and removes 'fa-' prefix from icon name values
  private _fixVault(data: VaultCollection[]) {
    if (data.length <= 0) return;

    const fix = (collection) => {

      if (collection.icon) {
        if (collection.icon.name.substring(0, 6) === 'fa fa-') {
          collection.icon.name = collection.icon.name.substring(6);
          collection.icon.class = 'fa';
        }
        if (collection.icon.name.substring(0, 12) === 'fa-brand fa-') {
          collection.icon.name = collection.icon.name.substring(12);
          collection.icon.class = ['fa', 'fa-brand'];
        }
      }

      collection.collections.forEach(coll => coll = fix(coll));

      return collection;
    };

    return fix(data);
  }
}
