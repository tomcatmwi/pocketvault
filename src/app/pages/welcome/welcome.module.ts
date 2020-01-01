import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { WelcomeComponent } from "./welcome.component";
import { WelcomeRoutingModule } from "./welcome.routing";
import { SharedModule } from "~/app/shared/shared.module";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        WelcomeRoutingModule,
        SharedModule
    ],
    declarations: [
        WelcomeComponent
    ],
})
export class WelcomeModule { }