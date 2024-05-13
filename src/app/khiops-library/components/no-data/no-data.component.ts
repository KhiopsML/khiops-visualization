import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'kl-no-data',
  templateUrl: './no-data.component.html',
})
export class NoDataComponent {
  @Input() message: string;
  text: string = '';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.updateText();
  }

  ngOnChanges(): void {
    this.updateText();
  }

  updateText() {
    if (!this.message) {
      this.text = this.translate.instant('NO_DATAS.DEFAULT');
    } else {
      this.text = this.translate.instant(this.message);
    }
  }
}
