import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rowIdentifierPipe',
})
export class RowIdentifierPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return (
      value &&
      value.filter((e) => {
        return e.headerName !== '_id';
      })
    );
  }
}
