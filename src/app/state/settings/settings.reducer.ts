import { SettingsActions } from './settings.actions';
import * as settingsActions from './settings.actions';

export function reducer(state: any, action: settingsActions.SettingsAction) {

    const payload = action['payload'] || null;

    switch (action.type) {

        case SettingsActions.ChangeLocaleComplete: {
            return {
                ...state,
                locale: payload,
            }
        }

        case SettingsActions.ChangeCipher:
            return {
                ...state,
                cipher: payload
            }

        case SettingsActions.ChangeMasterPass:
            return {
                ...state,
                masterPassword: payload
            }

        default: return { ...state }
    }

}