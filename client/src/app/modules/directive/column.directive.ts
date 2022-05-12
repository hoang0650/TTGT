import { ContentChild, Directive, EventEmitter, Input, Output } from '@angular/core';
import { CellDirective } from './cell.directive';
import { HeaderDirective } from './header.directive';
import { COL_DATA_TYPE, SortFn, SortOrder } from '../models/types';

@Directive({
  selector: 'appColumn'
})
export class ColumnDirective {
  @Input() header = '';
  @Input() key = '';
  @Input() renderkey = '';
  @Input() dataType = COL_DATA_TYPE.TEXT;
  @Input() sortTable = false;
  @Input() sortOrder: SortOrder = null;
  @Input() sortFn: SortFn | null = null;
  @Output() sortChange = new EventEmitter<{key:string, order: SortOrder}>();
  @ContentChild(CellDirective,{static:true}) tplCell?: CellDirective;
  @ContentChild(HeaderDirective,{static:true}) tplHeader?: HeaderDirective;
  constructor() { }

}
