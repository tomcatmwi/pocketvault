import { Injectable } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { Locale } from '~/app/state/settings/settings.state';
import * as appSettings from 'tns-core-modules/application-settings';

const locales = require('~/app/assets/defaults.json').locales;
const languages = require('~/app/assets/i18n.json');

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  currentLocale: Locale = locales[0];

  constructor() { }

  //  Also called by the the ChangeLocale effect
  changeLanguage(locale: Locale): Observable<string> {

    this.currentLocale = locale;

    //  Save language to app settings so it can be automatically loaded at next startup
    if (appSettings.hasKey('language'))
      appSettings.remove('language');
    appSettings.setString('language', locale.key);

    return Observable.create(observer => {
      observer.next(locale);
    });
  }

  translate(token: string, values: object = {}): string {
    let retval = token;

    //  find translation
    let translation = languages[this.currentLocale.key];

    token.split('.').forEach(key => {
      if (!!translation && !!translation[key]) {
        translation = translation[key];
      } else {
        translation = null;
      }
    });

    if (translation && typeof translation === 'string') {
      retval = translation;

      //  replace value placeholders
      if (values) {
        Object.keys(values).forEach(key => {
          const rx = new RegExp('{{\\s*' + key + '\\s*}}', 'gm');
          retval = retval.replace(rx, values[key]);
        });
      }
    }

    return retval;
  }

  translateBatch(input: Array<any>, values: object | null, nodes?: string | Array<string>): Array<any> {
    const output = [];

    input.forEach(e => {
      if (!!nodes) {
        const temp = Object.assign(e);
        if (Array.isArray(nodes)) {
          nodes.forEach(node => {
            if (temp[node] && typeof temp[node] === 'string') {
              temp[node] = this.translate(temp[node], values);
            }
          });
        } else {
          temp[nodes] = this.translate(temp[nodes], values);
        }
        output.push(temp);
      } else {
        output.push(this.translate(e, values));
      }
    });

    return output;
  }
}

@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private _translateService: TranslateService) { }

  transform(value: string, args: object): string {
    return value ? this._translateService.translate(value, args) : null;
  }
}