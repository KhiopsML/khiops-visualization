import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	ChangeDetectionStrategy
} from '@angular/core';

import {
	TranslateService
} from '@ngstack/translate';

@Component({
	selector: 'kl-btn-fullscreen',
	templateUrl: './btn-fullscreen.component.html',
	styleUrls: ['./btn-fullscreen.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BtnFullscreenComponent implements OnInit {

	isFullscreen: boolean;
	@Output() toggleFullscreen: EventEmitter < boolean > = new EventEmitter();

	constructor(public translate: TranslateService) {}

	ngOnInit() {}

	clickFullscreen() {
		this.isFullscreen = !this.isFullscreen;
		this.toggleFullscreen.emit(this.isFullscreen);
	}

}
