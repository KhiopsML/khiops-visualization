import { Component, SimpleChanges, OnChanges, Input } from '@angular/core';
import { UtilsService } from '../../providers/utils.service';
import { CellVO } from '@khiops-library/model/cell-vo';

@Component({
  selector: 'kl-cell-stats',
  templateUrl: './cell-stats.component.html',
  styleUrls: ['./cell-stats.component.scss'],
})
export class CellStatsComponent implements OnChanges {
  @Input() selectedCells: CellVO[];
  datas: {
    F: number;
    EF: number;
    I: number;
    Total: number;
  };

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.selectedCells?.currentValue) {
      if (changes?.selectedCells?.currentValue.length > 1) {
        // Multiple selection
        this.datas = {
          F: UtilsService.arraySum(
            this.selectedCells.map((e) => e.displayedFreqValue),
          ),
          EF: UtilsService.arraySum(
            this.selectedCells.map((e) => e.displayedValue?.ef),
          ),
          I:
            this.selectedCells[0].displayedValue?.type === 'MUTUAL_INFO'
              ? UtilsService.arraySum(
                  this.selectedCells.map((e) => e.displayedValue.value),
                )
              : undefined,
          Total:
            this.selectedCells[0].displayedValue?.type === 'MUTUAL_INFO'
              ? UtilsService.arraySum(
                  this.selectedCells.map((e) => e.displayedValue.extra),
                )
              : undefined,
        };
      } else if (changes?.selectedCells?.currentValue.length === 1) {
        // Simple selection
        this.datas = {
          F: this.selectedCells[0].displayedFreqValue,
          EF: this.selectedCells[0].displayedValue?.ef,
          I:
            this.selectedCells[0].displayedValue?.type === 'MUTUAL_INFO'
              ? this.selectedCells[0].displayedValue?.value
              : undefined,
          Total:
            this.selectedCells[0].displayedValue?.type === 'MUTUAL_INFO'
              ? this.selectedCells[0].displayedValue?.extra
              : undefined,
        };
      }
    }
  }
}
