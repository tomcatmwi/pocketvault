const locales = require('~/app/assets/defaults.json').locales;

export interface Locale {
    "id": string;
    "key": string;
    "name": string;
    "dateFormat": string;
}

export interface Settings {
    locale: Locale;
    cipher: string | null;
    masterPassword: string;
    changed: boolean;
}

export const initialState = {
    locale: locales[0],
    cipher: 'AES',
    masterPassword: null,
    changed: false
} as Settings;
