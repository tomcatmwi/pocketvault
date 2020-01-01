import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ns-icon-link',
  templateUrl: './icon-link.component.html'
})
export class IconLinkComponent {

  @Input() text: string;
  @Input() icon: string;
  @Input() row: number = 0;
  @Input() col: number = 0;

  @Output('onTap') onTap = new EventEmitter();

  constructor() { }

  tap() {
    this.onTap.emit(true);
  }

}
