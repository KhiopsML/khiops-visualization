import {
	Component,
	Input,
	AfterViewInit,
	NgZone
} from '@angular/core';

@Component({
	template: ''
})
export class WatchResizeComponent implements AfterViewInit {

	[sizeChanged: string]: any; // Index signature for sizeChanged callback

	@Input() id: any;
	@Input() watchResize = true;
	el: Element;

	constructor(public ngzone: NgZone) {

	}

	ngAfterViewInit(): void {
		setTimeout(() => {
			if (this.watchResize && this.id) {

				// @ts-ignore
				const observer = new ResizeObserver(entries => {

					entries.forEach(entry => {
						this.ngzone.run(
							() => {
								try {
									this.sizeChanged(entry.contentRect.width);
								} catch (e) {

								}
							}
						);

					});
				});
				this.el = document.getElementById(this.id);
				if (this.el) {
					observer.observe(this.el);
				}
			}
		});

	}

}
