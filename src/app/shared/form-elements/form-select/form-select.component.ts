import { Component, Input, Output, forwardRef, EventEmitter, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectItem {
  value: any;
  text: string;
}

@Component({
  selector: 'ns-form-select',
  templateUrl: './form-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true
    }
  ]
})
export class FormSelectComponent implements ControlValueAccessor, OnInit {

  @Input() public title: string;
  @Input() public selectedValue: any;
  @Input() public items: SelectItem[];
  @Input() public androidCloseButtonIcon: string;

  @Output('change') change = new EventEmitter();

  val: any;

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor() { }

  set value(val) {
    this.val = val;
    this.selectedValue = val;
    this.onChange(val);
    this.onTouched(val);
    this.change.emit({ value: val });
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) {
    this.onTouched = fn;
  }

  writeValue(value) {
    this.value = value;
  }

  ngOnInit() {
    if (!this.items || this.items.length === 0) return;
    if (!this.selectedValue) this.selectedValue = this.items[0].value;
    this.value = this.selectedValue;
  }

  selectValue(event) {
    this.value = event.object.selectedValue;
  }


}
