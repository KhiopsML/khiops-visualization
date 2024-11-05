import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngstack/translate';

@Component({
  selector: 'kl-no-data',
  templateUrl: './no-data.component.html',
})
export class NoDataComponent {
  @Input() private message?: string;
  public text: string = '';

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.updateText();
  }

  ngOnChanges(): void {
    this.updateText();
  }

  updateText() {
    if (!this.message) {
      this.text = this.translate.get('NO_DATAS.DEFAULT');
    } else {
      this.text = this.translate.get(this.message);
    }
  }
}
