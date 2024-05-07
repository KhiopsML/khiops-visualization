import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatrixOptionsI } from '@khiops-library/interfaces/matrix-options';
import { AppConfig } from 'src/environments/environment';

@Component({
  selector: 'kl-matrix-toggle',
  templateUrl: './matrix-toggle.component.html',
  styleUrls: ['./matrix-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixToggleComponent implements OnChanges {
  @Input() matrixOptions: MatrixOptionsI = new MatrixOptionsI();
  @Output() matrixOptionChange = new EventEmitter<string>();

  constructor() {}

  ngAfterViewInit() {}

  ngOnChanges() {
    this.matrixOptions.selected =
      localStorage.getItem(
        AppConfig.visualizationCommon.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION',
      ) || this.matrixOptions.types[0];
  }

  changeMatrixType(type: string) {
    // this.trackerService.trackEvent('click', 'matrix_type', type);
    localStorage.setItem(
      AppConfig.covisualizationCommon.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION',
      type,
    );
    this.matrixOptions.selected = type;
    this.matrixOptionChange.emit(type);
  }
}
