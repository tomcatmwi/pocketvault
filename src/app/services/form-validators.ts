import { FormControl } from '@angular/forms';

export class CustomValidators {
    static invalidPassword(control: FormControl) {
        if (control.disabled) { return null; }
        const psw = control.value;

        if (!psw || psw === '')
            return { invalidPassword: true, message: 'validators.no-password' }

        if (psw.length < 8)
            return { invalidPassword: true, message: 'validators.password-too-short' }

        if (psw.length > 64)
            return { invalidPassword: true, message: 'validators.password-too-long' }

        return null;
    }

    static stringLimit(minLength: Number, maxLength: Number) {
        return (control: FormControl) => {
            if (!!minLength && (!control.value || control.value.length < minLength)) {
                return { stringLimit: false, message: 'validators.string-too-short' }
            }
            if (!!maxLength && control.value.length > maxLength) {
                return { stringLimit: false, message: 'validators.string-too-long' }
            }
            return null
        }
    }

}