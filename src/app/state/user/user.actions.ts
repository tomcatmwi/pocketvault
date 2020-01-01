import { Action } from '@ngrx/store';
import { User } from './user.state';

export enum UserActions {
    Login = '[User] Login',
    LoginFail = '[User] Login failed',
    LoginComplete = '[User] Login complete',
    Logout = '[User] Logout',
    LogoutFail = '[User] Logout failed',
    LogoutComplete = '[User] Logout complete'
}

export class Login implements Action {
    readonly type: string = UserActions.Login;
    constructor() { }
}

export class LoginFail implements Action {
    readonly type: string = UserActions.LoginFail;
    constructor() { }
}

export class LoginComplete implements Action {
    readonly type: string = UserActions.LoginComplete;
    constructor(public payload: any) { }
}

export class Logout implements Action {
    readonly type: string = UserActions.Logout;
    constructor() { }
}

export class LogoutFail implements Action {
    readonly type: string = UserActions.LogoutFail;
    constructor(public payload?: any) { }
}

export class LogoutComplete implements Action {
    readonly type: string = UserActions.LogoutComplete;
    constructor(public payload?: any) { }
}

export type UserAction = Login | LoginFail | LoginComplete | Logout | LogoutFail | LogoutComplete;
