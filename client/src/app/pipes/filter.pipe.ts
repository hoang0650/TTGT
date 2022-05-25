import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(arr: any[], condition:any, args?:any): any {
    if (typeof condition == "function") {
      if (args) {
        return arr.filter((el: any) => condition(el, args))
      }
      return arr.filter(condition)
    } else {
      return _.filter(arr, condition)
    }
  }
}
