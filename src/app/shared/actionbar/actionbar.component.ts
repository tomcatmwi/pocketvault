import { Component, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import { AppService } from '~/app/services/app.service';
import * as app from "tns-core-modules/application";

@Component({
  selector: 'ns-actionbar',
  templateUrl: './actionbar.component.html'
})
export class ActionbarComponent {

  @Input() public title: string;
  @Input() public backButton: boolean = false;
  @Input() public menu: boolean = true;
  @Output('onBackButton') public onBackButton = new EventEmitter();
  @ViewChild('sidedrawer', { static: false }) public sidedrawer: RadSideDrawer;

  isTablet: boolean = false;

  constructor(
    private _appService: AppService
  ) { }

  ngOnInit() {
    this.isTablet = this._appService.isTablet;
  }

  back() {
    if (!this.backButton) return;
    this.onBackButton.emit(true);
  }

  openMenu() {
    const sidedrawer = <RadSideDrawer>app.getRootView();
    sidedrawer.showDrawer();
  }

}
