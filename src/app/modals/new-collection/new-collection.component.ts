import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { TranslateService } from '~/app/services/translate.service';
import { AppService } from '~/app/services/app.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { ModalTemplateComponent } from '~/app/modals/modal-template/modal-template.component';
import { CustomValidators } from '~/app/services/form-validators';

@Component({
  selector: 'ns-new-collection',
  templateUrl: './new-collection.component.html'
})
export class NewCollectionComponent extends ModalTemplateComponent implements OnInit, OnDestroy {

  constructor(
    _params: ModalDialogParams,
    _translateService: TranslateService,
    _appService: AppService,
    _fb: FormBuilder,
    _page: Page,
  ) {
    super(_params, _translateService, _appService, _fb, _page);
  }

  ngOnInit() {
    super.ngOnInit();

    this.spinner = false;

    //  Build form
    this.form = this._fb.group({
      name: [this._params.context.name || '', CustomValidators.stringLimit(3, 64)],
      icon: [this._params.context.icon || null],
    });

    //  Set all items to pristine
    Object.keys(this.form.controls).forEach(x => {
      this.form.controls[x].markAsPristine();
    });
  }

  submitForm() {
    this.spinner = true;

    //  Delay is needed so spinner will arrive to the form-icon-selector and the spinner to kick in
    //  Why is that needed? Because closing the modal takes 4-5 seconds due to Font Awesome.
    setTimeout(() => this._params.closeCallback(this.form.value), 10);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.spinner = false;
  }

}
