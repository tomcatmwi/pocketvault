import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { TranslateService } from '~/app/services/translate.service';
import { AppService } from '~/app/services/app.service';
import { SelectItem } from '~/app/shared/form-elements/form-select/form-select.component';
import { CustomValidators } from '~/app/services/form-validators';
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalTemplateComponent } from '~/app/modals/modal-template/modal-template.component';
import * as dialogs from 'tns-core-modules/ui/dialogs';
const defaults = require('~/app/assets/defaults.json');

@Component({
  selector: 'ns-master-password',
  templateUrl: './master-password.component.html'
})
export class MasterPasswordComponent extends ModalTemplateComponent implements OnInit, OnDestroy {

  ciphers = defaults.ciphers;
  cipherSelect: SelectItem[] = [];
  cipherHint: string;
  showCipher: boolean = true;
  masterPassSecure: boolean = true;
  gotVault: boolean = true;
  modifyPass: boolean = false;

  constructor(
    _params: ModalDialogParams,
    _translateService: TranslateService,
    _appService: AppService,
    _fb: FormBuilder,
    _page: Page,
  ) {
    super(_params, _translateService, _appService, _fb, _page);
  }

  public get currentCipher() {
    if (!!this.form.controls.cipher.value)
      return this.ciphers.find(x => x.id === this.form.controls.cipher.value)
    else
      return this.ciphers.find(x => x.id === this._params.context.cipher);
  }

  ngOnInit() {
    super.ngOnInit();
    this.gotVault = this._params.context.gotVault;
    this.modifyPass = this._params.context.modifyPass;

    //  Get list of ciphers
    this.ciphers.forEach(cipher => {
      cipher.name = `cipher.${cipher.id}`;
      cipher.description = `cipher.${cipher.id}-description`;
    });
    this.ciphers = this._translateService.translateBatch(this.ciphers, null, ['name', 'description']);

    this.ciphers.forEach(cipher => {
      this.cipherSelect.push({
        value: cipher.id,
        text: cipher.name
      });
    });

    //  Build form
    this.form = this._fb.group({
      masterPass: [this.modifyPass ? this._params.context.masterPassword : '', CustomValidators.invalidPassword],
      cipher: [this._params.context.cipher || this.ciphers[0].id]
    });

  }

  cipherChange(event) {
    if (event.value === 'NONE') {
      this.form.controls.masterPass.reset();
      this.form.controls.masterPass.disable();
    } else {
      this.form.controls.masterPass.enable();
    }
  }

  submitForm() {

    //  No encryption selected - ask if sure
    if (this.form.controls.cipher.value === 'NONE') {
      const confirm = {
        title: this._translateService.translate('general.warning'),
        message: this._translateService.translate('masterpass-modal.no-encryption'),
        okButtonText: this._translateService.translate('general.sure-button'),
        cancelButtonText: this._translateService.translate('general.no-go-back-button')
      };
      dialogs.confirm(confirm).then(res => { if (!res) return; });
    }

    //  All good, close modal and pass values to the parent form
    this._params.closeCallback({
      masterPassword: this.form.controls.masterPass.value,
      cipher: this.form.controls.cipher.value
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
