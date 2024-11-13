import { Component, Input } from '@angular/core';
import { ZoomToolsEventsService } from '@khiops-library/components/zoom-tools/zoom-tools.service';

@Component({
  selector: 'kl-zoom-tools',
  templateUrl: './zoom-tools.component.html',
  styleUrls: ['./zoom-tools.component.scss'],
})
export class ZoomToolsComponent {
  @Input() public alignment: string = 'column';

  constructor(private zoomToolsEventsService: ZoomToolsEventsService) {}

  onClickOnZoomIn() {
    this.zoomToolsEventsService.emitZoomIn();
  }

  onClickOnResetZoom() {
    this.zoomToolsEventsService.emitZoomReset();
  }

  onClickOnZoomOut() {
    this.zoomToolsEventsService.emitZoomOut();
  }
}
