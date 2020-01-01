import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from '~/app/services/form-validators';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { AppService } from '~/app/services/app.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalTemplateComponent } from '~/app/modals/modal-template/modal-template.component';
import { TranslateService } from '~/app/services/translate.service';

@Component({
  selector: 'ns-search-form',
  templateUrl: './search-form.component.html',
})
export class SearchFormComponent extends ModalTemplateComponent implements OnInit, OnDestroy {

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
      search: ['', Validators.compose([CustomValidators.stringLimit(3, 255)])],
      itemTitles: [true],
      itemValues: [false],
      collections: [false]
    });
  }

  submitForm() {
    this._params.closeCallback(this.form.value);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
