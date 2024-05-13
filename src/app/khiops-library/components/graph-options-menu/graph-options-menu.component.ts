import {
  Component,
  Input,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { DistributionOptionsI } from '@khiops-library/interfaces/distribution-options';

@Component({
  selector: 'kl-graph-options-menu',
  templateUrl: './graph-options-menu.component.html',
  styleUrls: ['./graph-options-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphOptionsMenuComponent {
  @Input() graphOptions: DistributionOptionsI;
  @Output() graphOptionsChange = new EventEmitter<string>();

  changeGraphOption(option: string) {
    this.graphOptions.selected = option;
    this.graphOptionsChange.emit(option);
  }
}
