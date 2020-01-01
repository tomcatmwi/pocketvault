import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { HelpComponent } from "./help.component";
import { HelpRoutingModule } from "./help.routing";
import { SharedModule } from "~/app/shared/shared.module";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        HelpRoutingModule,
        SharedModule
    ],
    declarations: [
        HelpComponent
    ],
})
export class HelpModule { }