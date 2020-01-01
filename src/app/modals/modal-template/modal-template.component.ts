import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { registerElement } from 'nativescript-angular/element-registry';
import { CardView } from '@nstudio/nativescript-cardview';
import { TranslateService } from '~/app/services/translate.service';
import { AppService } from '~/app/services/app.service';
import * as dialogs from 'tns-core-modules/ui/dialogs';

registerElement('CardView', () => CardView);

export interface DialogCancel {
  title: string;
  message: string;
  okButtonText: string;
  cancelButtonText: string;
}

@Component({
  selector: 'ns-modal-template',
  templateUrl: './modal-template.component.html',
})
export class ModalTemplateComponent implements OnInit, OnDestroy {

  form: FormGroup;
  isTablet: boolean = false;
  isAndroid: boolean = false;

  cancelConfirmOptions: DialogCancel = {
    title: 'general.abort',
    message: 'general.modal-cancel',
    okButtonText: 'general.yes-button',
    cancelButtonText: 'general.no-button'
  };

  //  In case there's a spinner
  spinner: boolean = false;

  constructor(
    protected _params: ModalDialogParams,
    protected _translateService: TranslateService,
    protected _appService: AppService,
    protected _fb: FormBuilder,
    protected _page: Page
  ) { }

  ngOnInit() {
    this.isTablet = this._appService.isTablet;
    this.isAndroid = this._appService.isAndroid;

    //  Translate confirm dialog strings
    Object.keys(this.cancelConfirmOptions).forEach(x => this.cancelConfirmOptions[x] = this._translateService.translate(this.cancelConfirmOptions[x]));

    //  Android hardware Back button listener - see app.service
    if (this.isAndroid)
      this._page.on('BackButton', () => this.cancel(), this);

  }

  ngOnDestroy() {
    //  Cancel back button listener
    if (this.isAndroid)
      this._page.off('BackButton');
    this.spinner = false;
  }

  cancel(message?: string) {

    if (!!message)
      this.cancelConfirmOptions.message = this._translateService.translate(message);

    dialogs.confirm(this.cancelConfirmOptions)
      .then(res => {
        if (!res) return;
        this.spinner = true;

        //  Timeout is needed so the callback will actually run before the modal closes
        setTimeout(() => this._params.closeCallback(null), 10);
      });
  }


}
