import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  transform(items: any[], searchText: string, args?:string[]): any[] {
    
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.toLocaleLowerCase();

    return items.filter(it => {
      var tmpItem = it;

      if (args) {
        args.forEach(arg => {
          tmpItem = tmpItem[arg]
        });
      }
     
      return tmpItem.toLocaleLowerCase().includes(searchText);
    });
  }
}
