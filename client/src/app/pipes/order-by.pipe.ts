import { Pipe, PipeTransform } from '@angular/core';
import 'lodash';

declare var _: any;

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {

  transform(arr: any, condition:string[], order?:string[]): any {
    if (order) {
      return _.orderBy(arr, condition, order);
    }
    else {
      return _.orderBy(arr, condition);
    }
  }

}
