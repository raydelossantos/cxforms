import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'utcLocal'})
export class UtcLocalPipe implements PipeTransform {
    transform(value: string): string {
        
        var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
               navigator.userAgent &&
               navigator.userAgent.indexOf('CriOS') == -1 &&
               navigator.userAgent.indexOf('FxiOS') == -1;

        if (isSafari) {
            //  Safari do not support the date format “yyyy-mm-dd”
            var date = new Date(value.replace(/-/g, '/') + '+00:00');
            return date.toISOString();
        }

        var date = new Date(value + '+00:00');
        return date.toISOString();
        
    }
}