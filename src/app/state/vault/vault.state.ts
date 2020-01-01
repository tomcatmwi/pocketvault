export interface Vault {

    //  vault content
    data: string | VaultCollection[] | null;

    //  path to the currently viewed collection
    currentCollection: string[],

    //  is the vault loaded?
    loaded: boolean;

    //  is the vault decrypted?
    decrypted: boolean;

    //  how many unlock attempts happened?
    //  (not actually used, but why not)
    unlockAttempts?: number | null;

    //  timestamp of last successful change
    //  used to watch changes in main.component
    lastChanged: number,

    //  clipboard to store copied/cut elements in main.component
    clipboard: {
        collection: VaultCollection,
        item: VaultItem
    }
}

export const initialState = {
    data: null,
    currentCollection: [],
    loaded: false,
    decrypted: false,
    unlockAttempts: null,
    lastChanged: new Date().getTime(),
    clipboard: {
        collection: null,
        item: null
    }
} as Vault;

//  Format for JSON file saved in the cloud
export interface SavedVault {
    userid: string;
    language: string;
    cipher: string;
    lastsave: number;
    vault: string | VaultCollection[];
}

//  Single item in the Vault
export interface VaultItem {
    id: string;
    name: string;
    value: string;
    comment?: string;
    created: number;
    lastModified?: number;
}

//  Collection in the Vault
export interface VaultCollection {
    id: string;
    name: string;
    icon: Icon;
    created: number;
    items?: VaultItem[]
    collections?: VaultCollection[]
}

//  Icon for collections
export interface Icon {
    name: string | null;
    color?: string;
    background?: string;
}

//  Clipboard - to copy and paste items and collections
export interface Clipboard {
    collection?: VaultCollection,
    item?: VaultItem
}