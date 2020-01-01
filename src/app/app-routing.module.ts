import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
import * as appSettings from 'tns-core-modules/application-settings';

const routes: Routes = [
    { path: "", redirectTo: appSettings.getBoolean('notFirstRun') ? "/login" : "/welcome", pathMatch: "full" },
    { path: "login", loadChildren: "~/app/pages/login/login.module#LoginModule" },
    { path: "welcome", loadChildren: "~/app/pages/welcome/welcome.module#WelcomeModule" },
    { path: "help", loadChildren: "~/app/pages/help/help.module#HelpModule" },
    { path: "main", loadChildren: "~/app/pages/main/main.module#MainModule" },
    { path: "settings", loadChildren: "~/app/pages/settings/settings.module#SettingsModule" },
    { path: "search", loadChildren: "~/app/pages/search/search.module#SearchModule" },
]

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
