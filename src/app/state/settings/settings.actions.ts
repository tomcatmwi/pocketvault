import { Action } from '@ngrx/store';
import { Locale } from '~/app/state/settings/settings.state';

export enum SettingsActions {
    ChangeLocale = '[Settings] Change locale',
    ChangeLocaleComplete = '[Settings] Change locale completed',
    ChangeCipher = '[Settings] Change cipher',
    ChangeMasterPass = '[Settings] Change Master Password',
    Success = '[Settings] Operation successful',
    Fail = '[Settings] Operation failed'
}

export class ChangeLocale implements Action {
    readonly type: string = SettingsActions.ChangeLocale;
    constructor(public payload: Locale) { }
}

export class ChangeLocaleComplete implements Action {
    readonly type: string = SettingsActions.ChangeLocaleComplete;
    constructor(public payload: string) { }
}

export class ChangeCipher implements Action {
    readonly type: string = SettingsActions.ChangeCipher;
    constructor(public payload: string) { }
}

export class ChangeMasterPass implements Action {
    readonly type: string = SettingsActions.ChangeMasterPass;
    constructor(public payload: string) { }
}

export class Success implements Action {
    readonly type: string = SettingsActions.Success;
    constructor() { }
}

export class Fail implements Action {
    readonly type: string = SettingsActions.Fail;
    constructor() { }
}

export type SettingsAction = ChangeLocale | ChangeLocaleComplete | ChangeCipher | ChangeMasterPass | Success | Fail;
