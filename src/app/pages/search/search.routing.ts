import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SearchComponent } from './search.component'

const routes: Routes = [
    { path: "", component: SearchComponent },
];

@NgModule({
    exports: [NativeScriptRouterModule],
    imports: [NativeScriptRouterModule.forChild(routes)]
})
export class SearchRoutingModule { }