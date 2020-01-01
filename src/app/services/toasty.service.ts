import { Injectable } from '@angular/core';
import { Toasty, ToastDuration, ToastPosition } from 'nativescript-toasty';

@Injectable({
  providedIn: 'root'
})
export class ToastyService {

  constructor() { }

  toasty(text: string = 'No message specified',
    position: string = 'BOTTOM',
    duration: string = 'SHORT'
  ) {

    new Toasty({ text: text })
      .setToastDuration(ToastDuration[duration.toUpperCase()])
      .setToastPosition(ToastPosition[position.toUpperCase()])
      .show();
  }

}
