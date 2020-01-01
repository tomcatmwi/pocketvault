import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ns-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormCheckboxComponent),
      multi: true
    }
  ]
})
export class FormCheckboxComponent implements ControlValueAccessor {

  @Input() label: string;

  _val: boolean = false;
  onChange: any = () => { };
  onTouched: any = () => { };

  constructor() { }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    this._val = value;
  }

  get value() {
    return this._val;
  }

  set value(value) {
    this._val = value;
    this.onChange(value);
    this.onTouched(value);
  }


}
