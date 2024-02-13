import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';
import { KhiopsLibraryService } from '../providers/khiops-library.service';
import { UtilsService } from '../providers/utils.service';

@Pipe({
  name: 'toPrecision',
  pure: false,
})
export class ToPrecisionPipe implements PipeTransform {
  numberPrecision: number;

  constructor(private khiopsLibraryService: KhiopsLibraryService) {
    this.numberPrecision =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.TO_FIXED;
  }

  transform(input: any, count?: number): string {
    const precision = count || this.numberPrecision;
    return UtilsService.getPrecisionNumber(input, precision);
  }
}
