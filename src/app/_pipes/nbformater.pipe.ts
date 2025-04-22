import { Pipe, PipeTransform } from '@angular/core';
import { configuration, environment } from 'src/environments/environment';
import { instanceType } from '../utils';

@Pipe({
	name: 'NbFormater',
    standalone: false,
})
export class NbFromater implements PipeTransform {

    
    public thousandFormat: string
    public hundrads: string
    public thousands: string


	constructor() {
        const decimalFormat = configuration[instanceType()]["decimal_format"] ?? "###,###,###";
        const formatArray = decimalFormat.split(/[,.\\s]/);
        this.thousandFormat = formatArray[formatArray.length - 2];
        
        let tmp = decimalFormat.split('#').join('')
        this.hundrads = tmp[1];
        this.thousands = tmp[0];
	}

    
    formatNumber(value: number): string {
		if (value < 1000) {
			return this.format("###", value);
		} else {
			let hundreds = value % 1000;
			let other = (value / 1000) | 0;
			return this.format("," + this.thousandFormat, other) + this.hundrads + this.format("000", hundreds);
		}
    }

    format(pattern: string, value: number): string {
        const formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: (pattern.split('.')[1] || '').length,
          useGrouping: true,
        });
      
        let formatted = formatter.format(value);
        if (this.thousands !== ',') {
          formatted = formatted.replace(/,/g, this.thousands);
        }
        return formatted;
      }


	transform(value: string): string {
        try{
            return this.formatNumber(parseInt(value))
        }
        catch(e){
            return value
        }
	}

}
