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
    const symbol = (value < 0 ? '<span class="mv-auto">-&nbsp;</span>' : '');
    let res = '<span class="d-flex"><span class="mv-auto">' + (amount % 100)
      + '</span><i class="copper ml-1 mr-1 mv-auto"></i></span>';
    if (amount < 100) {
      return symbol + res;
    }
    res = '<span class="d-flex"><span class="mv-auto">' + (Math.floor((amount % 10000) / 100))
      + '</span><i class="silver ml-1 mr-1 mv-auto"></i></span>' + res;
    if (amount < 10000) {
      return symbol + res;
    }
    return symbol + '<span class="d-flex"><span class="mv-auto">' + Math.floor(amount / 10000)
      + '</span><i class="gold ml-1 mr-1 mv-auto"></i></span>' + res;
  }
}
