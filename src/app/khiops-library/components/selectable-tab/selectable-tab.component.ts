import {
	Component,
	Input,
	OnChanges,
	ChangeDetectionStrategy,
	SimpleChanges,
} from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
	template: "",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectableTabComponent implements OnChanges {
	@Input() selectedTab: MatTabChangeEvent;
	tabIndex: number;
	loadingView = true;

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (
			changes.selectedTab &&
			changes.selectedTab
				.firstChange /* important to do not load when tab change to context (covisu)*/
		) {
			this.loadingView = true;

			this.loaded();
		}
	}

	loaded() {
		setTimeout(() => {
			this.loadingView = false;
			this.loadView();
		}, 150); // set > value than .mat-ink-bar transition animation to avoid freeze
	}

	loadView() {
		// on loaded, dispatch resize to refreshed graph
		setTimeout(() => {
			window.dispatchEvent(new Event("resize"));
		});
	}
}
