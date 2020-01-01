import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { WelcomeComponent } from './welcome.component'

const routes: Routes = [
    { path: "", component: WelcomeComponent },
];

@NgModule({
    exports: [NativeScriptRouterModule],
    imports: [NativeScriptRouterModule.forChild(routes)]
})
export class WelcomeRoutingModule { }