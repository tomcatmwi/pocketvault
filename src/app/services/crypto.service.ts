import { Injectable } from '@angular/core';
const CryptoJS = require("crypto-js");
const ciphers = require('~/app/assets/defaults.json').ciphers;

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  private _checkCipher(cipher: string) {
    return (ciphers.findIndex(x => x.id === cipher) === -1) ? 'AES' : cipher;
  }

  encrypt(input: any, password: string, cipher: string = 'AES') {
    cipher = this._checkCipher(cipher);
    return CryptoJS[cipher].encrypt(input.toString(), password);
  }

  decrypt(input: any, password: string, cipher: string = 'AES') {
    cipher = this._checkCipher(cipher);
    return CryptoJS[cipher].decrypt(input, password).toString(CryptoJS.enc.Utf8);
  }

}
