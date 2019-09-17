import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'adminAccessType'})
export class AdminAccessTypePipe implements PipeTransform {
    transform(value: number): string {
        switch (value) {
            case 0:
                return 'lock';      // no access
            case 1:
                return 'eye';       // view only
            case 2:
                return 'pencil';    // edit/write access
        }
    }
}