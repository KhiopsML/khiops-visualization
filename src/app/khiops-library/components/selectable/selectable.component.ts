import {
	Component,
	Input,
	AfterViewInit,
	OnDestroy,
	HostListener,
	ChangeDetectionStrategy,
	NgZone
} from '@angular/core';
import {
	WatchResizeComponent
} from '../watch-resize/watch-resize.component';
import {
	SelectableService
} from './selectable.service';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import {
	Subscription
} from 'rxjs';

@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableComponent extends WatchResizeComponent implements OnDestroy, AfterViewInit {

	@Input() id: [any] = undefined;
	@Input() type: [any];
	selectedServiceChangeSub: Subscription;

	constructor(public selectableService: SelectableService, public ngzone: NgZone, public configService: ConfigService) {

		super(ngzone, configService);

		// watch for changes and update css
		this.selectedServiceChangeSub = this.selectableService.selectedServiceChange.subscribe(value => {
			if (this.id && value && value.id) {
				const el = this.configService.getRootElementDom().querySelector("#" + this.id.toString());
				if (el) {
					if (value.id.toString() === this.id.toString()) {
						el.classList.add('selected');
					} else {
						if (el && el.classList) {
							el.classList.remove('selected');
						}
					}
				}
			}
		});
	}

	ngAfterViewInit(): void {
		// Call ngAfterViewInit of extend component
		super.ngAfterViewInit();
	}

	ngOnDestroy() {
		this.selectedServiceChangeSub.unsubscribe();
		if (this.agGrid) {
			this.destroyGrid();
		}
	}

	@HostListener('click', ['$event'])
	onClick(event) {
		if (event.isTrusted) {
			this.selectableService.setSelectedArea(this);
		}
	}

}
