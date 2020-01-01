import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { HelpComponent } from './help.component'

const routes: Routes = [
    { path: "", component: HelpComponent },
];

@NgModule({
    exports: [NativeScriptRouterModule],
    imports: [NativeScriptRouterModule.forChild(routes)]
})
export class HelpRoutingModule { }