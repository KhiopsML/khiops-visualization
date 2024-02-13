import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService, TranslateParams } from '@ngstack/translate';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
    this.translate.load();
  }

  transform(key: string, params?: TranslateParams): string {
    try {
      return this.translate.get(key, params);
    } catch (e) {
      console.log(e);
      return '';
    }
  }
}
