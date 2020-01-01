import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CustomValidators } from '~/app/services/form-validators';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { AppService } from '~/app/services/app.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalTemplateComponent } from '~/app/modals/modal-template/modal-template.component';
import { TranslateService } from '~/app/services/translate.service';

@Component({
  selector: 'ns-new-item',
  templateUrl: './new-item.component.html'
})
export class NewItemComponent extends ModalTemplateComponent implements OnInit, OnDestroy {

  constructor(
    _params: ModalDialogParams,
    _translateService: TranslateService,
    _appService: AppService,
    _fb: FormBuilder,
    _page: Page
  ) {
    super(_params, _translateService, _appService, _fb, _page);
  }

  ngOnInit() {
    super.ngOnInit();
    this.form = this._fb.group({
      name: [this._params.context.name || '', CustomValidators.stringLimit(1, 128)],
      value: [this._params.context.value || '', CustomValidators.stringLimit(1, 1024)],
      comment: [this._params.context.comment || '', CustomValidators.stringLimit(0, 1024)]
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  submitForm() {
    this._params.closeCallback(this.form.value);
  }
}
