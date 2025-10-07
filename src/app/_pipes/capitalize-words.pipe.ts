import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'capitalizeWords',
        standalone: false,
 })
export class CapitalizeWordsPipe implements PipeTransform {
    transform(value: string): string {
        return value
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
