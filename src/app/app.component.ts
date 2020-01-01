import { Component, OnInit } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import * as appSettings from 'tns-core-modules/application-settings';
import { ChangeLocale } from "~/app/state/settings";
import { Store } from "@ngrx/store";
import { AppService } from "~/app/services/app.service";

const locales = require('~/app/assets/defaults.json').locales;

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})
export class AppComponent implements OnInit {
    sideDrawerTransition: DrawerTransitionBase = new SlideInOnTopTransition();
    sideDrawerEnabled: boolean = false;

    constructor(
        private _store: Store<any>,
        private _appService: AppService
    ) { }

    ngOnInit() {

        //  This subscription controls whether the RadSideDrawer can be pulled into the screen or not. 
        //  Individual components can switch it by calling AppService.enableSideDrawer()
        this._appService.sideDrawerEnabled.subscribe(x => this.sideDrawerEnabled = x);

        //  Load saved language on startup
        if (appSettings.hasKey('language')) {
            const key = locales.findIndex(x => appSettings.getString('language') == x.key);
            if (key > -1)
                this._store.dispatch(new ChangeLocale(locales[key]));
        }
    }
}
