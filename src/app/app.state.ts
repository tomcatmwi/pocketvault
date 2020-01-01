import * as userStore from './state/user';
import * as settingsStore from './state/settings';
import * as vaultStore from './state/vault';
import { ActionReducerMap } from '@ngrx/store';

export interface AppState {
    user: userStore.User;
    settings: settingsStore.Settings;
    vault: vaultStore.Vault;
}

export const initialState: AppState = {
    user: userStore.initialState,
    settings: settingsStore.initialState,
    vault: vaultStore.initialState,
}

export const reducers: ActionReducerMap<any> = {
    user: userStore.reducer,
    settings: settingsStore.reducer,
    vault: vaultStore.reducer,
}

export const effects: Array<any> = [
    userStore.UserEffects,
    settingsStore.SettingsEffects,
    vaultStore.VaultEffects,
]

//  Selectors -------------------------------------------------------------------------------
export const currentUser = (s: AppState) => s.user;
export const settings = (s: AppState) => s.settings;
export const vault = (s: AppState) => s.vault;

//  Returns the current locale --------------------------------------------------------------
export const locale = (s: AppState) => s.settings.locale;

//  Returns the current locale string -------------------------------------------------------
export const localeString = (s: AppState) => s.settings.locale.key;

//  Returns the current collection's path ---------------------------------------------------
export const currentCollectionPath = (s: AppState) => s.vault.currentCollection;

//  Returns the current collection ----------------------------------------------------------
export const currentCollection = (s: AppState) => {
    const path = s.vault.currentCollection;
    if (!path || !path.length) return Object.assign({}, s.vault.data);
    let retval = s.vault.data;
    path.forEach(x => retval = retval['collections'][x]);
    return Object.assign({}, retval);
}

//  Returns the last change of the vault ---------------------------------------------------
export const lastVaultChange = (s: AppState) => {
    return s.vault.lastChanged
}

//  Returns the clipboard ------------------------------------------------------------------
export const clipboard = (s: AppState) => {
    return s.vault.clipboard
}