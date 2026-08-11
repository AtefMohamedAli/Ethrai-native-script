import { Pipe, PipeTransform } from '@angular/core';
import { localize } from '@nativescript/localize';

@Pipe({
    name: 'L',
    standalone: false
})
export class LocalizePipe implements PipeTransform {
    transform(value: string): string {
        return localize(value);
    }
}
