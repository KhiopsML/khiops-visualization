import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatrixOptionsI } from '@khiops-library/interfaces/matrix-options';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

@Component({
  selector: 'kl-matrix-toggle',
  templateUrl: './matrix-toggle.component.html',
  styleUrls: ['./matrix-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixToggleComponent implements OnChanges {
  AppConfig: any;

  @Input() matrixOptions: MatrixOptionsI = new MatrixOptionsI();
  @Output() matrixOptionChange = new EventEmitter<string>();

  constructor(private khiopsLibraryService: KhiopsLibraryService) {
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
  }

  ngAfterViewInit() {}

  ngOnChanges() {
    // may has been set by saved datas
    if (!this.matrixOptions.selected) {
      this.matrixOptions.selected =
        localStorage.getItem(
          this.AppConfig.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION',
        ) || this.matrixOptions.types[0];
    }
  }

  changeMatrixType(type: string) {
    // this.trackerService.trackEvent('click', 'matrix_type', type);
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'MATRIX_TYPE_OPTION',
      type,
    );
    this.matrixOptions.selected = type;
    this.matrixOptionChange.emit(type);
  }
}
