import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { MainComponent } from "./main.component";
import { MainRoutingModule } from "./main.routing";
import { SharedModule } from "~/app/shared/shared.module";

//  Form elements
import { FormIconSelectorComponent } from '~/app/shared/form-elements/form-icon-selector/form-icon-selector.component';

//  Modals
import { NewCollectionComponent } from '~/app/modals/new-collection/new-collection.component';
import { NewItemComponent } from '~/app/modals/new-item/new-item.component';

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        MainRoutingModule,
        SharedModule,
    ],
    declarations: [
        MainComponent,
        NewCollectionComponent,
        NewItemComponent,
        FormIconSelectorComponent,
    ],
    entryComponents: [
        NewCollectionComponent,
        NewItemComponent,
    ]
})
export class MainModule { }