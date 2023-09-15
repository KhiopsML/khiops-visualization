import {
	Component,
	OnInit,
	Input,
	Output,
	EventEmitter,
	ChangeDetectionStrategy
} from '@angular/core';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';

@Component({
	selector: 'kl-graph-header',
	templateUrl: './graph-header.component.html',
	styleUrls: ['./graph-header.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphHeaderComponent implements OnInit {

	maxScale: number;
	minScale: number;
	stepScale: number;

	// Get scale value from ls if set
	scaleValue: any;
	truncatedTitle;

	@Output() scaleValueChanged: EventEmitter < any > = new EventEmitter();
	@Output() toggleFullscreen ? : EventEmitter < boolean >= new EventEmitter();
	@Input() selectedVariable: any;
	@Input() title: string;
	@Input() smallTitle = false;
	@Input() hideScale = false;
	iterateTo = 0;

	constructor(
		private khiopsLibraryService: KhiopsLibraryService) {

		this.maxScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MAX_GRAPH_SCALE;
		this.minScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.MIN_GRAPH_SCALE;
		this.stepScale = this.khiopsLibraryService.getAppConfig().common.GLOBAL.STEP_GRAPH_SCALE;
		this.scaleValue = this.khiopsLibraryService.getAppConfig().common.GLOBAL.DEFAULT_GRAPH_SCALE;
	}

	ngOnInit() {
		this.scaleValueChanged.emit(this.scaleValue);
	}

	onToggleFullscreen($event) {
		this.toggleFullscreen.emit($event);
	}

	onScaleChanged(event: any) {
		// Save current scale value into ls
		localStorage.setItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'SCALE_VALUE', event.value);
		this.scaleValueChanged.emit(event.value);
	}

}
