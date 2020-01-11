import { Component, Input, Output, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ColorPicker } from 'nativescript-color-picker';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { TranslateService } from '~/app/services/translate.service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Icon } from '~/app/state/vault/vault.state';

const iconCategories = require('~/app/assets/icon-categories.json');
const icons = require('~/app/assets/icons.json');

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

  //  currently displayed icon set
  icons = [];

  //  array for ListPicker
  categories = [];

  searchString: string;
  currentCategory: string;
  private _showSpinner: boolean = false;

  //  The currently selected icon
  icon: Icon = {
    name: null,
    label: null,
    color: default_color,
    background: default_background,
    class: null
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

  writeValue(value: Icon) {
    if (value) {
      //  find category by current icon
      Object.keys(iconCategories).forEach(c => {
        if (iconCategories[c].includes(value.name))
          this.changeIconCategory(c, value);
      });

      this._scrollToIcon();
    } else
      this.changeIconCategory();
  }

  ngOnInit() {
    let categories = [];
    Object.keys(iconCategories).forEach(category => {
      categories.push({
        text: 'fontawesome.' + category,
        value: category
      });
    });
    categories = this._translateService.translateBatch(categories, null, 'text');
    this.categories = categories.sort((a, b) => a.text > b.text ? 1 : -1);
  }

  //  Changes the currently selected icon
  changeIcon(icon: Icon) {
    this.icon.name = icon.name;
    this.icon.label = icon.label;
    this.icon.class = icon.class;
    this.onChange(this.icon);
  }

  categoryChanged(event) {
    this.changeIconCategory(event.object.selectedValue);
  }

  //  Changes to a different icon category, selects first icon
  changeIconCategory(iconCategory?: string, icon?: Icon) {

    if (typeof iconCategory === 'undefined')
      iconCategory = Object.keys(iconCategories)[0];

    const category = iconCategories[iconCategory];
    this.currentCategory = iconCategory;

    const tempIcons = [];
    category.forEach(iconName => {
      const tempIcon = {
        name: iconName,
        label: icons[iconName].label,
        class: icons[iconName].class || 'fa'
      }
      tempIcons.push(tempIcon);
    });

    this.icons = tempIcons.sort((a, b) => a.label > b.label ? 1 : -1);
    this.changeIcon(icon ? icon : this.icons[0]);
    this.scrollView.nativeElement.scrollToHorizontalOffset(0, true);
    this.searchString = null;
  }

  //  Changes the color or background color of the icon
  selectColor(what: 0 | 1) {
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
      if (res.text.length > 64) res.text = res.text.substr(0, 64);

      this.spinner = true;
      this.searchString = res.text;

      const rx = new RegExp('^' + res.text, 'ig');

      const iconsFound = [];
      Object.keys(icons).forEach(i => {
        const icon = icons[i];

        icon.name = i;
        if (!icon.class) icon.class = 'fa';

        if (!!icon.label.match(rx) ||
          (!!icon.search && icon.search.includes(res.text.toLowerCase)))
          iconsFound.push(icon);
      });


      if (!iconsFound.length) {
        this.spinner = false;
        this.searchString = null;
        dialogs.alert({
          title: this._translateService.translate('form-icon-selector.search-error-title'),
          message: this._translateService.translate('form-icon-selector.search-error'),
          okButtonText: this._translateService.translate('general.ok-button'),
        });
      } else {
        this.icons = iconsFound.sort((a, b) => a.label > b.label ? 1 : -1);
        this.changeIcon(this.icons[0]);

        this.scrollView.nativeElement.scrollToHorizontalOffset(0, true);
        this.onChange(this.icon);
        this.spinner = false;
      }
    });
  }

  //  Sets the current icon and sets up other variables
  private _scrollToIcon() {
    this.searchString = null;
    const scrollPos = this.icons.findIndex(x => x.name === this.icon.name) * 60.5;

    //  delay is needed to let the icons to load
    setTimeout(() => {
      this.scrollView.nativeElement.scrollToHorizontalOffset(scrollPos, true);
    }, 1000);
  }

}
