import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ZoomToolsEventsService {
  private zoomIn = new Subject<string>();
  zoomIn$ = this.zoomIn.asObservable();
  emitZoomIn() {
    this.zoomIn.next('');
  }

  private zoomReset = new Subject<string>();
  zoomReset$ = this.zoomReset.asObservable();
  emitZoomReset() {
    this.zoomReset.next('');
  }

  private zoomOut = new Subject<string>();
  zoomOut$ = this.zoomOut.asObservable();
  emitZoomOut() {
    this.zoomOut.next('');
  }
}
