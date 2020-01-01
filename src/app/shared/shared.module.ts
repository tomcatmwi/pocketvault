import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NativeScriptFormsModule } from 'nativescript-angular/forms'
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { NativeScriptUIListViewModule } from "nativescript-ui-listview/angular";

//  Form elements
import { FormElementComponent } from '~/app/shared/form-elements/form-element/form-element.component';
import { NativeScriptPickerModule } from "nativescript-picker/angular";
import { FormSelectComponent } from '~/app/shared/form-elements/form-select/form-select.component';

//  Shared components
import { ModalTemplateComponent } from '~/app/modals/modal-template/modal-template.component';
import { ActionbarComponent } from '~/app/shared/actionbar/actionbar.component';

//  Pipes
import { TranslatePipe } from '~/app/services/translate.service';

//  Modals
import { MasterPasswordComponent } from '~/app/modals/master-password/master-password.component';

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        TNSFontIconModule.forRoot({ 'fa': require('~/styles/vendors/fontawesome.min.css') }),
        NativeScriptUIListViewModule,
        NativeScriptPickerModule,
    ],
    declarations: [
        ActionbarComponent,
        TranslatePipe,
        FormElementComponent,
        FormSelectComponent,
        ModalTemplateComponent,
        MasterPasswordComponent,
    ],
    providers: [
        FormBuilder,
    ],
    exports: [
        TNSFontIconModule,
        NativeScriptFormsModule,
        ReactiveFormsModule,
        TranslatePipe,
        FormElementComponent,
        ModalTemplateComponent,
        ActionbarComponent,
        NativeScriptUIListViewModule,
        MasterPasswordComponent,
        FormSelectComponent,
        NativeScriptPickerModule,
    ],
    entryComponents: [
        MasterPasswordComponent
    ]
})
export class SharedModule { }