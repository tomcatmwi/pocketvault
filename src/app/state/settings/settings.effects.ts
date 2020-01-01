import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SettingsActions, ChangeLocaleComplete, Fail, Success } from './settings.actions';
import { TranslateService } from '~/app/services/translate.service';

@Injectable()
export class SettingsEffects {
    constructor(
        private action$: Actions,
        private _translateService: TranslateService,
    ) { }

    //  Change language
    @Effect()
    public ChangeLocale$ = this.action$.pipe(
        ofType(SettingsActions.ChangeLocale),
        map((action: SettingsActions.ChangeLocale) => action['payload']),
        switchMap(locale =>
            this._translateService.changeLanguage(locale).pipe(
                map(res => new ChangeLocaleComplete(res)),
                catchError(() => of(new Fail()))
            )
        )
    );

}