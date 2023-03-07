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

@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableComponent extends WatchResizeComponent implements OnDestroy, AfterViewInit {

	@Input() id: [any];
	@Input() type: [any];
	selectedServiceChangeSub: any;

	constructor(public selectableService: SelectableService, public ngzone: NgZone) {

		super(ngzone);

		// watch for changes and update css
		this.selectedServiceChangeSub = this.selectableService.selectedServiceChange.subscribe(value => {
			if (this.id && value && value.id) {
				const el = document.getElementById(this.id.toString());
				if (el) {
					if (value.id.toString() === this.id.toString()) {
						if (this.id.includes('informations-block') || this.id.includes('description-block')) {
							el.parentElement.classList.add('parent-selected');
						} else {
							el.classList.add('selected');
						}
					} else {
						if (el && el.classList) {
							if (this.id.includes('informations-block') || this.id.includes('description-block')) {
								el.parentElement.classList.remove('parent-selected');
							} else {
								el.classList.remove('selected');
							}
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
