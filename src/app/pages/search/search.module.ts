import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { SearchComponent } from "./search.component";
import { SearchRoutingModule } from "./search.routing";
import { SharedModule } from "~/app/shared/shared.module";

//  Modals
import { SearchFormComponent } from '~/app/modals/search-form/search-form.component';

//  Form elements
import { FormCheckboxComponent } from '~/app/shared/form-elements/form-checkbox/form-checkbox.component';

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        SearchRoutingModule,
        SharedModule,
    ],
    declarations: [
        SearchComponent,
        SearchFormComponent,
        FormCheckboxComponent,
    ],
    entryComponents: [
        SearchFormComponent
    ]
})
export class SearchModule { }