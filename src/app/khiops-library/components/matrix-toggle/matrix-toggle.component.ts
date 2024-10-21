import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { LS } from '@khiops-library/enum/ls';
import { MatrixOptionsModel } from '@khiops-library/model/matrix-options.model';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';

@Component({
  selector: 'kl-matrix-toggle',
  templateUrl: './matrix-toggle.component.html',
  styleUrls: ['./matrix-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixToggleComponent implements OnChanges {
  AppConfig: any;

  @Input() matrixOptions: MatrixOptionsModel = new MatrixOptionsModel();
  @Output() matrixOptionChange = new EventEmitter<string>();

  constructor(
    private ls: Ls,
    private khiopsLibraryService: KhiopsLibraryService,
  ) {
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
  }

  ngOnChanges() {
    // may has been set by saved datas
    if (!this.matrixOptions.selected) {
      this.matrixOptions.selected = this.ls.get(
        LS.MATRIX_TYPE_OPTION,
        this.matrixOptions.types[0],
      );
    }
  }

  changeMatrixType(type: string) {
    // this.trackerService.trackEvent('click', 'matrix_type', type);
    this.ls.set(LS.MATRIX_TYPE_OPTION, type);
    this.matrixOptions.selected = type;
    this.matrixOptionChange.emit(type);
  }
}
