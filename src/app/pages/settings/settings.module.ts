import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { SettingsComponent } from "./settings.component";
import { SettingsRoutingModule } from "./settings.routing";
import { SharedModule } from "~/app/shared/shared.module";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        SettingsRoutingModule,
        SharedModule,
    ],
    declarations: [
        SettingsComponent
    ]
})
export class SettingsModule { }