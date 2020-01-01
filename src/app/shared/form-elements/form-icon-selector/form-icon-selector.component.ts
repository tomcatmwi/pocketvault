import { Component, Input, Output, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ColorPicker } from 'nativescript-color-picker';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { TranslateService } from '~/app/services/translate.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '~/app/state/vault/vault.state';

const defaults = require('~/app/assets/defaults.json');

const default_color = '#191923';
const default_background = '#fbfef9';

@Component({
  selector: 'ns-form-icon-selector',
  templateUrl: './form-icon-selector.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormIconSelectorComponent),
      multi: true
    }
  ]
})
export class FormIconSelectorComponent implements OnInit {

  //  Input default icon & color
  @Input() input: Icon;

  //  @Input getter/setters are safer than ngOnChange
  @Input('spinner') set spinner(value: boolean) {
    this._showSpinner = value;
  }

  get spinner() {
    return this._showSpinner;
  }

  @Output() output: Icon;
  @ViewChild('scrollView', { static: true }) scrollView: ElementRef;

  iconSets: string[] = ['fa-brand', 'fa'];    //  available icon categories
  icons = [];                                 //  currently displayed icon set
  iconSet: number;                            //  the current icon set's node name
  searchString: string;
  private _showSpinner: boolean = false;

  icon: Icon = {
    name: null,
    color: default_color,
    background: default_background
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor(
    private _translateService: TranslateService
  ) { }

  registerOnChange(fn) {
    this.onChange = fn;

    //  Timeout is needed to let Angular do its stuff before emitting default value
    setTimeout(() => {
      this.onChange(this.icon);
    }, 10);
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    if (value) {
      this.icon = value
      this._setIcon();
    } else
      this.icon = {
        name: this.icons[0],
        color: default_color,
        background: default_background
      }
  }

  private _setIcon() {
    this.searchString = null;
    const iSet = this.icon.name.substr(0, this.icon.name.indexOf(' '));
    this.iconSet = this.iconSets.findIndex(x => x === iSet);
    this.icons = defaults.icons.filter(x => this.iconSets[this.iconSet] + ' ' === x.substr(0, this.iconSets[this.iconSet].length + 1));
    const scrollPos = this.icons.findIndex(x => x.indexOf(this.icon.name) !== -1) * 60.5;

    //  delay is needed to let the icons to load
    setTimeout(() => {
      this.scrollView.nativeElement.scrollToHorizontalOffset(scrollPos, true);
    }, 1000);
  }

  ngOnInit() {
    if (!this.input)
      this.changeIconSet(0)
    else {
      this.icon = Object.assign({}, this.input);
      this.onChange(this.icon);
      this._setIcon();
    }
  }

  changeIconSet(iSet: number) {
    this.iconSet = iSet;
    this.icons = defaults.icons.filter(x => this.iconSets[iSet] + ' ' === x.substr(0, this.iconSets[iSet].length + 1));
    this.icon.name = this.icons[0];
    this.scrollView.nativeElement.scrollToHorizontalOffset(0, true);
    this.searchString = null;
    this.onChange(this.icon);
  }

  selectColor(what) {
    const picker = new ColorPicker();
    let color;
    switch (what) {
      case 0: color = this.icon.color; break;
      case 1: color = this.icon.background; break;
    }

    picker.show(color, 'RGB').then(res => {
      const hex = '#' + ((Number(res)) >>> 0).toString(16).substr(2, 6);
      switch (what) {
        case 0: this.icon.color = hex; break;
        case 1: this.icon.background = hex; break;
      }
      this.onChange(this.icon);
    });
  }

  searchIcon() {
    dialogs.prompt({
      title: this._translateService.translate('form-icon-selector.search-title'),
      okButtonText: this._translateService.translate('general.ok-button'),
      cancelButtonText: this._translateService.translate('general.cancel-button'),
      defaultText: this.searchString,

    }).then(res => {
      if (!res.result || !res.text) return;
      if (res.text.length > 32) res.text = res.text.substr(0, 32);

      const rx = new RegExp(res.text, 'ig');
      let icons = defaults.icons.filter(x => !!x.match(rx));

      if (!icons.length) {
        dialogs.alert({
          title: this._translateService.translate('form-icon-selector.search-error-title'),
          message: this._translateService.translate('form-icon-selector.search-error'),
          okButtonText: this._translateService.translate('general.ok-button'),
        });
      } else {
        this.icons = icons;
        this.searchString = res.text;
        this.icon.name = this.icons[0];
        this.onChange(this.icon);
      }
    });
  }

  updateFormControl() {
    this.onChange(this.icon);
  }

}
