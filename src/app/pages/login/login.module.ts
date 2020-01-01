import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { LoginComponent } from "./login.component";
import { LoginRoutingModule } from "./login.routing";
import { SharedModule } from "~/app/shared/shared.module";

import { IconLinkComponent } from '~/app/shared/form-elements/icon-link/icon-link.component';

//  Form elements
import { FormLanguageComponent } from '~/app/shared/form-elements/form-language/form-language.component';

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        LoginRoutingModule,
        SharedModule,
    ],
    declarations: [
        LoginComponent,
        IconLinkComponent,
        FormLanguageComponent
    ]
})
export class LoginModule { }