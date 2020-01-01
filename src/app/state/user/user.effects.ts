import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { UserActions, LoginFail, LoginComplete, LogoutFail, LogoutComplete } from './user.actions';
import { FirebaseAuthService } from '~/app/services/firebase-auth.service';
import { of } from 'rxjs';

@Injectable()
export class UserEffects {
    constructor(
        private action$: Actions,
        private _fbAuth: FirebaseAuthService
    ) { }

    //  Login
    @Effect()
    public Login$ = this.action$.pipe(
        ofType(UserActions.Login),
        switchMap(() => this._fbAuth.login().pipe(
            map(res => new LoginComplete(res)),
            catchError(() => of(new LoginFail()))
        ))
    );

    //  Logout
    @Effect()
    public Logout$ = this.action$.pipe(
        ofType(UserActions.Logout),
        switchMap(() => this._fbAuth.logout().pipe(
            map(res => new LogoutComplete(res)),
            catchError(err => of(new LogoutFail(err)))
        ))
    );
}