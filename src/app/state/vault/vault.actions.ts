import { Action } from '@ngrx/store';
import { Vault, VaultCollection, VaultItem, Clipboard } from './vault.state';
import { User } from '~/app/state/user';
import { Settings } from '~/app/state/settings';

export enum VaultActions {
    Clear = '[Vault] Clear',
    Empty = '[Vault] Empty',
    Load = '[Vault] Load',
    LoadComplete = '[Vault] Load completed',
    Decrypt = '[Vault] Decrypt',
    DecryptFail = '[Vault] Decrypt failed',
    DecryptComplete = '[Vault] Decrypt completed',
    GenerateDemo = '[Vault] Generate demo vault',
    GenerateDemoComplete = '[Vault] Generate demo vault completed',
    CurrentCollection = '[Vault] Retrieve current collection',
    CurrentCollectionComplete = '[Vault] Retrieve current collection completed',
    SwitchCollection = '[Vault] Switch collection',
    SwitchCollectionUp = '[Vault] Switch collection one level up',
    SwitchCollectionComplete = '[Vault] Switch collection completed',
    Reorder = '[Vault] Reorder',
    ReorderComplete = '[Vault] Reorder completed',
    AddCollection = '[Vault] Add collection',
    DeleteCollection = '[Vault] Delete collection',
    AddItem = '[Vault] Add item',
    DeleteItem = '[Vault] Delete item',
    Save = '[Vault] Save',
    Copy = '[Vault] Copy to clipboard',
    UpdateAndSave = '[Vault] Vault updated and saved',
    Update = '[Vault] Vault updated, not saved',
    Export = '[Vault] Export vault',
    DeleteExport = '[Vault] Delete exported files',
    Success = '[Vault] Operation successful',
    Fail = '[Vault] Operation failed',
}

export class Clear implements Action {
    readonly type: string = VaultActions.Clear;
    constructor() { }
}

export class Empty implements Action {
    readonly type: string = VaultActions.Empty;
    constructor() { }
}

export class Load implements Action {
    readonly type: string = VaultActions.Load;
    constructor(public payload: User) { }
}

export class LoadComplete implements Action {
    readonly type: string = VaultActions.LoadComplete;
    constructor(public payload: any) { }
}

export class Decrypt implements Action {
    readonly type: string = VaultActions.Decrypt;
    constructor(public payload: { vault: Vault, masterPassword: string; cipher: string; }) { }
}

export class DecryptFail implements Action {
    readonly type: string = VaultActions.DecryptFail;
    constructor() { }
}

export class DecryptComplete implements Action {
    readonly type: string = VaultActions.DecryptComplete;
    constructor(public payload: any) { }
}

export class GenerateDemo implements Action {
    readonly type: string = VaultActions.GenerateDemo;
    constructor() { }
}

export class GenerateDemoComplete implements Action {
    readonly type: string = VaultActions.GenerateDemoComplete;
    constructor(public payload: VaultCollection[]) { }
}

export class Reorder implements Action {
    readonly type: string = VaultActions.Reorder;
    constructor(public payload: { source: number, target: number, reorderWhat: 0 | 1 }) { }
}

export class ReorderComplete implements Action {
    readonly type: string = VaultActions.ReorderComplete;
    constructor(public payload: VaultCollection[]) { }
}

export class SwitchCollection implements Action {
    readonly type: string = VaultActions.SwitchCollection;
    constructor(public payload: string) { }
}

export class SwitchCollectionUp implements Action {
    readonly type: string = VaultActions.SwitchCollectionUp;
    constructor() { }
}

export class SwitchCollectionComplete implements Action {
    readonly type: string = VaultActions.SwitchCollectionComplete;
    constructor(public payload: VaultCollection[]) { }
}

export class CurrentCollection implements Action {
    readonly type: string = VaultActions.CurrentCollection;
    constructor() { }
}

export class AddCollection implements Action {
    readonly type: string = VaultActions.AddCollection;
    constructor(public payload: VaultCollection) { }
}

export class DeleteCollection implements Action {
    readonly type: string = VaultActions.DeleteCollection;
    constructor(public payload: string) { }
}

export class AddItem implements Action {
    readonly type: string = VaultActions.AddItem;
    constructor(public payload: VaultItem) { }
}


export class DeleteItem implements Action {
    readonly type: string = VaultActions.DeleteItem;
    constructor(public payload: string) { }
}

export class Save implements Action {
    readonly type: string = VaultActions.Save;
    constructor() { }
}

export class Copy implements Action {
    readonly type: string = VaultActions.Copy;
    constructor(public payload: Clipboard) { }
}

export class Update implements Action {
    readonly type: string = VaultActions.Update;
    constructor(public payload: VaultCollection[]) { }
}

export class UpdateAndSave implements Action {
    readonly type: string = VaultActions.UpdateAndSave;
    constructor(public payload: VaultCollection[]) { }
}

export class Export implements Action {
    readonly type: string = VaultActions.Export;
    constructor(public payload: string) { }
}

export class DeleteExport implements Action {
    readonly type: string = VaultActions.DeleteExport;
    constructor() { }
}

export class Success implements Action {
    readonly type: string = VaultActions.Success;
    constructor() { }
}

export class Fail implements Action {
    readonly type: string = VaultActions.Fail;
    constructor() { }
}

export type VaultAction =
    Clear |
    Empty |
    Load |
    LoadComplete |
    Decrypt |
    DecryptFail |
    DecryptComplete |
    GenerateDemo |
    GenerateDemoComplete |
    Reorder |
    ReorderComplete |
    SwitchCollection |
    SwitchCollectionUp |
    SwitchCollectionComplete |
    AddCollection |
    DeleteCollection |
    DeleteItem |
    AddItem |
    Copy |
    Save |
    Update |
    UpdateAndSave |
    Export |
    DeleteExport |
    Success |
    Fail;

