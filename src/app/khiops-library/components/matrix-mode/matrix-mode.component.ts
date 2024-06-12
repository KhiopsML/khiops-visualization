import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatrixModeI } from '@khiops-library/interfaces/matrix-mode';
import { MatrixModesI } from '@khiops-library/interfaces/matrix-modes';
import { KhiopsLibraryService } from '@khiops-library/providers/khiops-library.service';

@Component({
  selector: 'kl-matrix-mode',
  templateUrl: './matrix-mode.component.html',
  styleUrls: ['./matrix-mode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixModeComponent implements OnChanges {
  AppConfig: any;
  @Input() matrixModes: MatrixModesI = new MatrixModesI();
  @Output() matrixModeChange = new EventEmitter<MatrixModeI>();

  constructor(private khiopsLibraryService: KhiopsLibraryService) {
    this.AppConfig = this.khiopsLibraryService.getAppConfig().common;
  }

  ngOnChanges() {
    if (!this.matrixModes.selected) {
      // Get previous selected target if compatible
      const previousSelectedModeIndex = localStorage.getItem(
        this.AppConfig.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION_INDEX',
      );
      if (previousSelectedModeIndex) {
        this.matrixModes.selected =
          this.matrixModes.types[previousSelectedModeIndex];
        this.matrixModes.selectedIndex = Number(previousSelectedModeIndex);
      } else {
        // Select first by default
        this.matrixModes.selected = this.matrixModes.types[0];
        this.matrixModes.selectedIndex = 0;
      }
    } else {
      // In case of variable selection change
      // We must update the combobox
      this.matrixModes.selected =
        this.matrixModes.types[this.matrixModes.selectedIndex];
    }
    this.matrixModeChange.emit(this.matrixModes.selected);
  }

  changeMatrixMode(mode: MatrixModeI) {
    this.matrixModes.selected = mode;
    this.matrixModes.selectedIndex = this.matrixModes.types.findIndex(
      (e) => e.mode === mode.mode,
    );
    localStorage.setItem(
      this.AppConfig.GLOBAL.LS_ID + 'MATRIX_MODE_OPTION_INDEX',
      this.matrixModes.selectedIndex.toString(),
    );

    this.matrixModeChange.emit(this.matrixModes.selected);
  }
}
