import { VaultActions } from './vault.actions';
import * as vaultActions from './vault.actions';

export function reducer(state: any, action: vaultActions.VaultAction) {

    const payload = action['payload'] || null;

    switch (action.type) {

        case VaultActions.Clear:
            return {
                ...state,
                data: null,
                currentCollection: null,
                loaded: false,
                decrypted: false,
                unlockAttempts: null,
                clipboard: {
                    collection: null,
                    item: null
                }
                //  Clear mustn't change lastChanged!
                //  It would trigger Save on logging out and overwrite the vault in the cloud with an empty one.
            }

        case VaultActions.Empty:
            return {
                ...state,
                data: {
                    items: [],
                    collections: []
                },
                currentCollection: null,
                clipboard: {
                    collection: null,
                    item: null
                },
                lastChanged: new Date().getTime()
            }


        case VaultActions.LoadComplete:
            return {
                ...state,
                data: payload.data,
                loaded: true,
                decrypted: payload.decrypted,
                unlockAttempts: 0,
                lastChanged: 0,  //  0 doesn't trigger saving in main.component
                clipboard: {
                    collection: null,
                    item: null
                }
            }

        case VaultActions.DecryptComplete:
            return {
                ...state,
                data: payload.data,
                decrypted: true,
                unlockAttempts: state.unlockAttempts + 1,
                lastChanged: 0
            }

        case VaultActions.DecryptFail:
            return {
                ...state,
                decrypted: false,
                unlockAttempts: state.unlockAttempts + 1
            }

        case VaultActions.SwitchCollectionComplete:
            return {
                ...state,
                currentCollection: payload
            }

        case VaultActions.SwitchCollectionUp:
            return {
                ...state,
                currentCollection: (state.currentCollection && !!state.currentCollection.length) ? state.currentCollection.slice(0, state.currentCollection.length - 1) : state.currentCollection
            }

        case VaultActions.Update:
            return {
                ...state,
                data: payload
            }

        case VaultActions.UpdateAndSave:
            return {
                ...state,
                data: payload,
                lastChanged: new Date().getTime()
            }

        case VaultActions.Copy:
            return {
                ...state,
                clipboard: payload
            }

        default: return { ...state }
    }

}