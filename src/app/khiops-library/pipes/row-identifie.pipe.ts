import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rowIdentifierPipe',
})
export class RowIdentifierPipe implements PipeTransform {
  transform(value: any, ..._args: any[]): any {
    return value?.filter((e: any) => {
      return e.headerName !== '_id';
    });
  }
}
