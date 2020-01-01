import { Component, Input, OnInit } from '@angular/core';
import { AppService } from '~/app/services/app.service';

@Component({
  selector: 'ns-form-element',
  templateUrl: './form-element.component.html'
})
export class FormElementComponent implements OnInit {

  @Input() public title: string;
  @Input() public error: string;
  @Input() public hint: string;
  @Input() public visible: boolean = true;
  @Input() public ignoreTablet: boolean = false;

  isTablet: boolean = false;

  constructor(private _appService: AppService) {
  }

  ngOnInit() {
    this.isTablet = !this.ignoreTablet && this._appService.isTablet;
  }

}
