import {
	Component,
	Input,
	OnChanges,
	ChangeDetectionStrategy,
	SimpleChanges
} from '@angular/core';

@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectableTabComponent implements OnChanges {

	@Input() selectedTab: any;
	tabConfig: any;
	tabIndex: number;
	loadingView = true;

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {

		if (changes.selectedTab && changes.selectedTab.firstChange /* important to do not load when tab change to context (covisu)*/ ) {

			this.loadingView = true;

			this.loaded();
		}
	}

	loaded() {
		setTimeout(() => {
			this.loadingView = false;
			this.loadView();
		}, this.tabConfig.TAB_ANIMATION_DURATION); // do it async to dont freeze interface during compute
	}

	loadView() {
		// on loaded, dispatch resize to refreshed graph
		setTimeout(() => {
			window.dispatchEvent(new Event('resize'));
		});
	}

}
