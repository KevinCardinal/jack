import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'gw2Gold'
})
export class Gw2GoldPipe implements PipeTransform {

  transform(value: number): string {
    if (value == null) {
      return '';
    }
    const amount = Math.abs(value);
    const symbol = value < 0 ? '- ' : '';
    let res = (amount % 100) + '<i class="copper ml-1 mr-1 mv-auto"></i>';
    if (amount < 100) {
      return symbol + res;
    }
    res = (Math.floor((amount % 10000) / 100)) + '<i class="silver ml-1 mr-1 mv-auto"></i>' + res;
    if (amount < 10000) {
      return symbol + res;
    }
    return symbol + Math.floor(amount / 10000) + '<i class="gold ml-1 mr-1 mv-auto"></i>' + res;
  }
}
