import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VaultCollection } from '~/app/state/vault/vault.state';
import { TranslateService } from '~/app/services/translate.service';
import { formatTime } from '~/app/utils';
import * as moment from 'moment';
import * as permissions from 'nativescript-permissions';
import * as fs from "tns-core-modules/file-system"
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { ToastyService } from '~/app/services/toasty.service';
import { FileSystemEntity } from 'tns-core-modules/file-system';
import { delay } from 'rxjs/operators';

declare var android: any;

@Injectable({
  providedIn: 'root'
})
export class VaultService {

  constructor(
    private _translateService: TranslateService,
    private _toastyService: ToastyService
  ) { }

  //  Switches the current collection to another one by id
  //  A falsy id switches to the root collection
  switchCollection(input) {

    //  find id
    let path = [];
    const vault = input.vault;
    if (!input.id || !vault.collections || !vault.collections.length) {
      return Observable.create(observer => observer.next(path));
    }

    //  recursive path finder
    //  if id isn't found, it'll return the root
    const search = (c, tempPath = []) => {

      if (c.id === input.id)
        path = tempPath.slice(0)
      else {
        if (c.collections) {
          c.collections.forEach((subcoll, i) => {
            tempPath.push(i);
            search(subcoll, tempPath);
          });
        }
        if (tempPath.length > 0) tempPath.length--;
      }
    };
    search(vault);

    return Observable.create(observer => observer.next(path));
  }

  //  Adds/edits child collections
  //  If id is not null, it will overwrite the collection with the same id (if it exists)
  //  If the passed item is identical to the one in the clipboard, it'll assume the user pasted it
  addCollection(input): Observable<VaultCollection[]> {

    return Observable.create(observer => {

      //  the entire vault
      let output = { ...input.vault };

      //  pointer to the current collection
      let vault = output;

      //  error message in case of failure
      let errorMsg = this._translateService.translate(!!input.id ? 'errors.cant-edit-collection' : 'errors.cant-add-collection');

      try {

        //  find current collection
        if (input.path)
          input.path.forEach(x => vault = vault.collections[x]);

        if (!!input.data.id) {

          //  paste from the clipboard
          if (input.data === input.clipboard)
            vault.collections.unshift(input.data)

          //  modify collection
          else {
            const collection = vault.collections[vault.collections.findIndex(x => x.id === input.data.id)];
            collection.name = input.data.name;
            collection.icon = input.data.icon;
          }
        }

        //  new collection
        else
          vault.collections.unshift({
            ...input.data,
            id: Math.random().toString(36).substring(8),
            created: new Date().getTime(),
            collections: [],
            items: []
          });

        observer.next(output);

      } catch (e) {
        dialogs.alert({
          title: this._translateService.translate('general.error-title'),
          message: errorMsg,
          okButtonText: this._translateService.translate('general.ok-button')
        }).then(() => observer.error(null));
      }

    });
  }

  //  Deletes a collection from the current collection as parent
  deleteCollection(input): Observable<VaultCollection[]> {
    return Observable.create(observer => {

      //  the entire vault
      let output = { ...input.vault };

      //  pointer to the current collection
      let vault = output;

      try {
        //  find current collection
        if (input.path)
          input.path.forEach(x => vault = vault.collections[x]);

        //  delete the subcollection passed in the input
        vault.collections.splice(vault.collections.findIndex(x => x.id === input.data), 1);
        observer.next(output);

      } catch (e) {
        dialogs.alert({
          title: this._translateService.translate('general.error-title'),
          message: this._translateService.translate('errors.cant-delete-collection'),
          okButtonText: this._translateService.translate('general.ok-button')
        }).then(() => observer.error(null));
      }
    });
  }

  reorderList(input): Observable<VaultCollection[]> {

    let output = input.vault;

    //  find current vault
    if (input.path)
      input.path.forEach(x => output = output.collections[x]);

    //  reorder collections
    if (input.reorderWhat === 0)
      output.collections.splice(input.target, 0, output.collections.splice(input.source, 1)[0])

    //  reorder items
    if (input.reorderWhat === 1)
      output.items.splice(input.target, 0, output.items.splice(input.source, 1)[0]);

    return new Observable(observer => {
      observer.next({ ...input.vault });
    });
  }

  //  Adds a new item to the current collection
  //  Also handles pasting from the clipboard
  addItem(input): Observable<VaultCollection[]> {
    return new Observable(observer => {

      let output = { ...input.vault };
      let vault = output;

      try {

        //  find current vault
        if (input.path)
          input.path.forEach(x => vault = vault.collections[x]);

        //  paste item from clipboard
        if (!!input.data.id) {
          if (input.data === input.clipboard)
            vault.items.unshift(input.clipboard)

          //  modify item
          else {
            const item = vault.items[vault.items.findIndex(x => x.id === input.data.id)];
            item.name = input.data.name;
            item.value = input.data.value;
            item.comment = input.data.comment || null;
            item.lastModified = new Date().getTime();
          }
        }

        //  add new item
        else
          vault.items.unshift({
            ...input.data,
            id: Math.random().toString(36).substring(8),
            created: new Date().getTime(),
            lastModified: new Date().getTime()
          });

        observer.next(output);

      } catch (e) {
        dialogs.alert({
          title: this._translateService.translate('general.error-title'),
          message: this._translateService.translate(!!input.data.id ? 'errors.cant-edit-item' : 'errors.cant-add-item'),
          okButtonText: this._translateService.translate('general.ok-button')
        }).then(() => observer.error(null));
      }
    });
  }

  //  Deletes an item from the current collection
  deleteItem(input): Observable<VaultCollection[]> {
    return Observable.create(observer => {

      //  the entire vault
      let output = { ...input.vault };

      //  pointer to the current collection
      let vault = output;

      try {
        //  find current collection
        if (input.path)
          input.path.forEach(x => vault = vault.collections[x]);

        //  delete the subcollection passed in the input
        vault.items.splice(vault.items.findIndex(x => x.id === input.data), 1);
        observer.next(output);

      } catch (e) {
        dialogs.alert({
          title: this._translateService.translate('general.error-title'),
          message: this._translateService.translate('errors.cant-delete-item'),
          okButtonText: this._translateService.translate('general.ok-button')
        }).then(() => observer.error(null));
      }
    });
  }

  //  Exports the Vault into a text or JSON file
  exportVault(input): Observable<any> {

    return new Observable(observer => {

      const now = new Date();

      permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
        .then(() => {

          //  Generate saved output
          let output = '';
          if (input.format === 'json')
            output = JSON.stringify(input.vault, null, 2)
          else {

            output = this._translateService.translate('settings.save-vault-header', { saveDate: moment(now).format(input.dateFormat) + ' ' + formatTime(now) });

            //  Recursion: Creates formatted text file -------------------------------------------------------------------------
            const addCollection = (collection, padding = '') => {

              output += '\n';
              if (collection.name) {
                output += `${padding}${collection.name}\n`;
                output += `${padding}${String('').padEnd(collection.name.length, '=')}\n\n`;
              }

              collection.items.forEach(item => {
                output += `${padding}  ${item.name}: ${item.value}\n`;
                if (item.comment)
                  output += `${padding}  (${item.comment})\n`;
                output += `${padding}  ${this._translateService.translate('export.date-created')}: ${moment(new Date(item.created)).format(input.dateFormat)} ${formatTime(new Date(item.created))} - `;
                output += `${this._translateService.translate('export.date-last-modified')}: ${moment(new Date(item.lastModified)).format(input.dateFormat)} ${formatTime(new Date(item.lastModified))}\n`;
                output += '\n';
              });

              collection.collections.forEach(subcollection => {
                addCollection(subcollection, padding + '  ');
              });

            }

            addCollection(input.vault);
          }

          //  Save file -------------------------------------------------------------------------

          const filename = `Pocket Vault ${moment(now).format('YYYY-MM-DD')} ${formatTime(now)}.${input.format}`;
          const sdDownloadPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).toString();
          const file = fs.Folder.fromPath(sdDownloadPath).getFile(filename);

          file.writeText(output)
            .then(() => {
              this._toastyService.toasty(this._translateService.translate('settings.vault-saved'));
              observer.next(null);
            }).catch(() => {
              dialogs.alert({
                title: this._translateService.translate('general.error-title'),
                message: this._translateService.translate('settings.vault-save-error'),
                okButtonText: this._translateService.translate('general.ok-button')
              }).then(() => observer.next(null));
            });

        })
        .catch(() => {
          observer.next(null);
        })

    });
  }

  deleteExport(): Observable<any> {
    return new Observable(observer => {

      permissions.requestPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)
        .then(() => {

          const sdDownloadPath = android.os.Environment.getExternalStoragePublicDirectory(android.os.Environment.DIRECTORY_DOWNLOADS).toString();
          fs.Folder.fromPath(sdDownloadPath).getEntities()
            .then(entities => {

              const entitiesFiltered = entities.filter(x => x.name.indexOf('Pocket Vault') !== -1);

              if (entitiesFiltered.length <= 0) {
                this._toastyService.toasty(this._translateService.translate('settings.exports-delete-no-files'));
                observer.next(null);
                return;
              }

              //  -----------------------------------------------------------------------------------------------------

              const errors = [];
              let counter = entitiesFiltered.length;

              entitiesFiltered.forEach(async entity => {

                //  Generate zero block, same size as the file
                const file = fs.Folder.fromPath(sdDownloadPath).getFile(entity.name);
                const zeroes = String('').padEnd(file.size, '0');

                //  Overwrite file with zeroes
                await file.writeText(zeroes)
                  .then(() => {
                    //  zerofill OK, delete file
                    file.remove()
                      .then(() => {
                        //  File deleted!
                        counter--;

                        //  Finished? Show reports and finish Observable
                        if (counter <= 0) {

                          //  Report errors
                          if (!!errors.length) {
                            dialogs.alert({
                              title: this._translateService.translate('general.error-title'),
                              message: this._translateService.translate('settings.exports-cant-safe-delete-file', { errors: errors.length, success: (entitiesFiltered.length - errors.length) }),
                              okButtonText: this._translateService.translate('general.ok-button')
                            }).then(() => observer.next(null));

                            //  Or report success
                          } else {
                            this._toastyService.toasty(this._translateService.translate('settings.exports-deleted', { count: entitiesFiltered.length }));
                            observer.next(null);
                          }
                        }

                      })
                      .catch(error => {
                        //  Error handler: Can't delete file
                        errors.push(file.name);
                      });
                  }).catch(error => {
                    //  Error handler: Can't zerofill file
                    errors.push(file.name);
                  });
              });

            })
            .catch(() => {
              //  Unable to access download path
              dialogs.alert({
                title: this._translateService.translate('general.error-title'),
                message: this._translateService.translate('settings.exports-delete-failed'),
                okButtonText: this._translateService.translate('general.ok-button')
              }).then(() => observer.next(null));
            });
        })
        .catch(() => {
          //  User didn't give permission to access filesystem
          observer.next(null);
        });

    });
  }

}
