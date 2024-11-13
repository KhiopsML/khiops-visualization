import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { KhiopsLibraryService } from '../../providers/khiops-library.service';
import { Ls } from '@khiops-library/providers/ls.service';
import { LS } from '@khiops-library/enum/ls';

@Component({
  selector: 'kl-graph-header',
  templateUrl: './graph-header.component.html',
  styleUrls: ['./graph-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphHeaderComponent implements OnInit {
  @Output() public toggleFullscreen?: EventEmitter<boolean> =
    new EventEmitter();
  @Output() private scaleValueChanged: EventEmitter<number> =
    new EventEmitter();

  @Input() public selectedVariable: any; // Type depends of the context
  @Input() public title: string = '';
  @Input() public smallTitle = false;
  @Input() public hideScale = false;
  @Input() public showZoom = false;

  public maxScale: number;
  public minScale: number;
  public stepScale: number;
  public scaleValue: number;

  constructor(
    private khiopsLibraryService: KhiopsLibraryService,
    private ls: Ls,
  ) {
    this.maxScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
    this.minScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;
    this.stepScale =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.STEP_GRAPH_SCALE;
    this.scaleValue =
      this.khiopsLibraryService.getAppConfig().common.GLOBAL.DEFAULT_GRAPH_SCALE;
  }

  ngOnInit() {
    this.scaleValueChanged.emit(this.scaleValue);
  }

  onToggleFullscreen($event: boolean | undefined) {
    this.toggleFullscreen?.emit($event);
  }

  onScaleChanged(value: number) {
    // Save current scale value into ls
    this.ls.set(LS.SCALE_VALUE, value.toString());
    this.scaleValueChanged.emit(value);
  }
}
