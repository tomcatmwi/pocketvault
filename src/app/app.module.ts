import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";

//  App core
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

//  Global services
import { FirestoreService } from "./services/firestore.service";
import { FirebaseAuthService } from "./services/firebase-auth.service";
import { CryptoService } from "./services/crypto.service";
import { TranslateService } from './services/translate.service';
import { VaultService } from './services/vault.service';

//  Shared / child components
import { SidedrawerComponent } from './shared/sidedrawer/sidedrawer.component';

//  ngrx root state
//  (There are no feature states)
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from "@ngrx/effects";
import { initialState, reducers, effects } from '~/app/app.state';

//  Shared module
import { SharedModule } from './shared/shared.module';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        StoreModule.forRoot(reducers, { initialState }),
        EffectsModule.forRoot(effects),
        NativeScriptUISideDrawerModule,
        SharedModule,
    ],
    declarations: [
        AppComponent,
        SidedrawerComponent,
    ],
    providers: [
        FirebaseAuthService,
        FirestoreService,
        CryptoService,
        TranslateService,
        VaultService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
})

export class AppModule { }
