import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService, DialogContentI } from '@khiops-library/providers/dialog.service';
import { Observable } from 'rxjs';
import { LevelDistributionGraphComponent } from '../level-distribution-graph/level-distribution-graph.component';

@Component({
  selector: 'app-dialog-wrapper',
  templateUrl: './dialog-wrapper.component.html',
  styleUrls: ['./dialog-wrapper.component.scss'],
  standalone: false,
})
export class DialogWrapperComponent implements OnInit {
  public dialogContent$: Observable<DialogContentI>;

  @ViewChild('levelDistributionGraph', { static: false })
  levelDistributionGraph?: LevelDistributionGraphComponent;

  constructor(private dialogService: DialogService) {
    this.dialogContent$ = this.dialogService.dialogContent$;
  }

  ngOnInit(): void {
    // Dialog service is initialized in constructor
  }

  /**
   * Close the dialog
   */
  closeDialog(): void {
    this.dialogService.closeDialog();
  }

  /**
   * Track dialog type for ngIf
   */
  trackDialogType(_index: number, dialogContent: DialogContentI): string {
    return dialogContent.type;
  }
}
