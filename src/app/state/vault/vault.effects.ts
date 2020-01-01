import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom, tap } from 'rxjs/operators';
import {
    VaultActions,
    LoadComplete,
    Clear,
    DecryptComplete,
    DecryptFail,
    SwitchCollectionComplete,
    Success,
    Fail,
    Update,
    UpdateAndSave
} from './vault.actions';
import { FirestoreService } from '~/app/services/firestore.service';
import { of } from 'rxjs';
import { VaultService } from '~/app/services/vault.service';
import { Store } from '@ngrx/store';
import { VaultCollection } from '~/app/state/vault/vault.state';

@Injectable()
export class VaultEffects {

    constructor(
        private action$: Actions,
        private _store: Store<any>,
        private _firestoreService: FirestoreService,
        private _vaultService: VaultService,
    ) { }

    //  Load vault (but not decrypt)
    @Effect()
    public Load$ = this.action$.pipe(
        ofType(VaultActions.Load),
        map((action: VaultActions.Load) => action['payload']),
        switchMap(uid =>
            this._firestoreService.loadVault(uid).pipe(
                map(res => new LoadComplete(res)),
                catchError(() => of(new Clear()))
            )
        )
    );

    //  Decrypt vault (called when loaded)
    @Effect()
    public Decrypt$ = this.action$.pipe(
        ofType(VaultActions.Decrypt),
        map((action: VaultActions.Decrypt) => action['payload']),
        switchMap(payload =>
            this._firestoreService.decryptVault(payload.vault, payload.masterPassword, payload.cipher).pipe(
                map(res => new DecryptComplete(res)),
                catchError(() => of(new DecryptFail()))
            )
        )
    );

    //  Generate demo vault (called when the vault is new and empty)
    @Effect()
    public GenerateDemo$ = this.action$.pipe(
        ofType(VaultActions.GenerateDemo),
        switchMap(() =>
            this._firestoreService.generateDemo().pipe(
                map(res => new UpdateAndSave(res))
            )
        )
    );

    //  Moves a collection or an item to a different position within the current collection
    @Effect()
    public Reorder$ = this.action$.pipe(
        ofType(VaultActions.Reorder),
        map((action: VaultActions.Reorder) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            ...x[0],
            vault: x[1].vault.data,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.reorderList(payload).pipe(
                map(res => new Update(<VaultCollection[]>res))
            )
        )
    );

    //  Switch to collection by specified id
    @Effect()
    public SwitchCollection$ = this.action$.pipe(
        ofType(VaultActions.SwitchCollection),
        map((action: VaultActions.Decrypt) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            id: x[0],
            vault: x[1].vault.data,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.switchCollection(payload).pipe(
                map(res => new SwitchCollectionComplete(<VaultCollection[]>res)),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Add/edit collection
    @Effect()
    public AddCollection$ = this.action$.pipe(
        ofType(VaultActions.AddCollection),
        map((action: VaultActions.AddCollection) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            data: x[0],
            vault: x[1].vault.data,
            clipboard: x[1].vault.clipboard.collection,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.addCollection(payload).pipe(
                map(res => new UpdateAndSave(<VaultCollection[]>res)),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Delete collection
    @Effect()
    public DeleteCollection$ = this.action$.pipe(
        ofType(VaultActions.DeleteCollection),
        map((action: VaultActions.DeleteCollection) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            data: x[0],
            vault: x[1].vault.data,
            clipboard: x[1].vault.clipboard.collection,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.deleteCollection(payload).pipe(
                map(res => {
                    if (payload.clipboard.id === payload.data)
                        return new Update(<VaultCollection[]>res)
                    else
                        return new UpdateAndSave(<VaultCollection[]>res)
                }),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Add/edit item
    @Effect()
    public AddItem$ = this.action$.pipe(
        ofType(VaultActions.AddItem),
        map((action: VaultActions.AddItem) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            data: x[0],
            vault: x[1].vault.data,
            clipboard: x[1].vault.clipboard.item,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.addItem(payload).pipe(
                map(res => new UpdateAndSave(<VaultCollection[]>res)),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Delete item
    @Effect()
    public DeleteItem$ = this.action$.pipe(
        ofType(VaultActions.DeleteItem),
        map((action: VaultActions.DeleteItem) => action['payload']),
        withLatestFrom(this._store),
        map(x => ({
            data: x[0],
            vault: x[1].vault.data,
            clipboard: x[1].vault.clipboard.item,
            path: x[1].vault.currentCollection
        })),
        switchMap(payload =>
            this._vaultService.deleteItem(payload).pipe(
                map(res => {
                    if (payload.clipboard === payload.data)
                        return new Update(<VaultCollection[]>res)
                    else
                        return new UpdateAndSave(<VaultCollection[]>res)
                }),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Export Vault to a file
    @Effect()
    public Export$ = this.action$.pipe(
        ofType(VaultActions.Export),
        withLatestFrom(this._store),
        map(x => ({
            format: x[0],
            user: x[1].user,
            vault: x[1].vault.data,
            dateFormat: x[1].settings.locale.dateFormat
        })),
        switchMap(payload =>
            this._vaultService.exportVault(payload).pipe(
                map(() => new Success()),
                catchError(() => of(new Fail()))
            )
        )
    );

    //  Delete exports
    @Effect()
    public DeleteExport$ = this.action$.pipe(
        ofType(VaultActions.DeleteExport),
        switchMap(() => this._vaultService.deleteExport().pipe(
            map(() => new Success())
        ))
    );

    //  Save Vault to cloud
    @Effect()
    public Save$ = this.action$.pipe(
        ofType(VaultActions.Save),
        withLatestFrom(this._store),
        map(x => ({
            user: x[1].user,
            settings: x[1].settings,
            vault: x[1].vault.data
        })),
        switchMap(payload =>
            this._firestoreService.saveVault(payload.user, payload.settings, payload.vault).pipe(
                map(() => new Success()),
                catchError(() => of(new Fail()))
            )
        )
    );

}
