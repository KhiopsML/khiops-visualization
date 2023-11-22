import {
	Component,
	OnChanges,
	AfterViewInit,
	Input,
	SimpleChanges,
	HostListener,
	Output,
	EventEmitter,
	ChangeDetectionStrategy,
	OnDestroy,
	NgZone
} from '@angular/core';
import {
	SelectableComponent
} from '../selectable/selectable.component';
import {
	SelectableService
} from '../selectable/selectable.service';
import _ from 'lodash';
import { ConfigService } from '@khiops-library/providers/config.service';

@Component({
	template: '',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollableGraphCanvasComponent extends SelectableComponent implements OnChanges, AfterViewInit, OnDestroy {
	@Input() maxScale: number;
	@Input() minScale: number;
	@Input() inputDatas: any;
	@Input() scrollPosition: any;
	@Input() scaleValue = 0;
	@Input() view: any;
	@Input() graphIdContainer: any;
	@Output() scrollPositionChanged: EventEmitter < any > = new EventEmitter();

	@Output() mouseWheelUp = new EventEmitter();
	@Output() mouseWheelDown = new EventEmitter();
	graphWrapper: any;

	constructor(public selectableService: SelectableService,
		public ngzone: NgZone,
		public configService: ConfigService) {
		super(selectableService, ngzone, configService);
		this.onScroll = this.onScroll.bind(this);
	}

	@HostListener('window:resize', ['$event'])
	keyEvent(event) {
		this.resizeGraph();
	}

	ngAfterViewInit() {
		// Resize at init to take saved scale value
		this.resizeGraph(true);
	}

	initScrollEvents() {
		setTimeout(() => {

			// init scroll position to 0
			this.scrollPosition = 0;

			this.graphWrapper = this.configService.getRootElementDom().querySelector('#' + this.graphIdContainer);
			if (this.graphWrapper && this.graphWrapper.children[0]) {
				const el: any = this.graphWrapper.children[0];
				el.addEventListener('scroll', this.onScroll, {
					passive: true
				});
				this.graphWrapper.addEventListener('wheel', this.mouseWheelFunc.bind(this), {
					passive: true
				});
			}
		});

	}

	ngOnDestroy() {

		const graphWrapper: any = this.configService.getRootElementDom().querySelector('#' + this.graphIdContainer);
		if (graphWrapper && graphWrapper.children[0]) {
			const el: any = graphWrapper.children[0];
			el.removeEventListener('scroll', this.onScroll, {
				passive: true
			});
			graphWrapper.removeEventListener('wheel', this.mouseWheelFunc.bind(this), {
				passive: true
			});
		}
	}

	ngOnChanges(changes: SimpleChanges) {

		if (changes.inputDatas && changes.inputDatas.currentValue) {
			if (!this.graphWrapper && changes.inputDatas.firstChange) {
				this.initScrollEvents();
			}
			if (!changes.inputDatas.firstChange) {
				// Resize graph on iput change to recompute scale.
				this.resizeGraph();
			}

		}

		// change scale
		if (changes.scaleValue && changes.scaleValue.currentValue && !changes.scaleValue.firstChange) {
			this.resizeGraph();
		}

		// change scroll position on change
		if (changes.scrollPosition && changes.scrollPosition.currentValue && !changes.scrollPosition.firstChange) {
			const graphWrapper: any = this.configService.getRootElementDom().querySelector('#' + this.graphIdContainer);
			if (graphWrapper && graphWrapper.children[0]) {
				const el: any = graphWrapper.children[0];
				let srollLeft = changes.scrollPosition.currentValue;
				if (srollLeft < 10) {
					srollLeft = 0;
				}
				el.scrollLeft = srollLeft;
			}
		}
	}

	onScroll(event) {
		this.scrollPositionChanged.emit(event.currentTarget.scrollLeft);
	}

	resizeGraph(firstRender = false) {
		if (this.inputDatas) {

			const graphWrapper: any = this.configService.getRootElementDom().querySelector('#' + this.graphIdContainer);

			if (graphWrapper && graphWrapper.children[0]) {

				const el: any = graphWrapper.children[0].children[0];

				const elMonitor: any = el.children[0];
				const elCanvas: any = el.children[1];
				const parent: any = el.parentNode;

				const parentWidth = parent.offsetWidth;
				const parentHeight = parent.offsetHeight;
				let compWidth = this.inputDatas.labels.length * this.scaleValue * 0.6;
				const maxCompDatasWidth = this.inputDatas.labels.length * this.maxScale * 0.6;

				if (maxCompDatasWidth > 15000) {
					// compWidth = 15000; // Do not make canvas too big to prevent memory leaks
					compWidth = compWidth * 15000 / maxCompDatasWidth;
				}

				let bottomScrollbar = 10;

				let currentWidth = 0;
				if (compWidth < parentWidth || parentWidth === 0 || this.scaleValue === this.minScale) {
					// fit to container if few bar datas
					currentWidth = parentWidth;
					bottomScrollbar = 0;
				} else {
					// else give a big width to the container
					currentWidth = compWidth;
				}

				el.style.width = currentWidth + 'px';
				if (!firstRender) {
					elMonitor.style.width = currentWidth + 'px';
				} else {
					elMonitor.style.width = '0px';
				}

				// Resize height if div height change
				if (elCanvas) {
					el.style.height = parentHeight - bottomScrollbar + 'px'; // 10 = scrollbar
					elCanvas.style.height = parentHeight - bottomScrollbar + 'px';
					elMonitor.style.height = parentHeight - bottomScrollbar + 'px'; // In case of height resize
					if (!firstRender) {
						elCanvas.style.width = currentWidth + 'px';
					} else {
						elCanvas.style.width = '0px';
					}
				}

			}
		}
	}

	mouseWheelFunc(event: any) {

		const graphWrapper: any = this.configService.getRootElementDom().querySelector('#' + this.graphIdContainer);
		if (graphWrapper && graphWrapper.children[0]) {
			const el: any = graphWrapper.children[0].children[0];

			const maxScrollLeft = el.scrollWidth - graphWrapper.clientWidth;

			// add delta to scroll horizontally
			this.scrollPosition = this.scrollPosition + event.deltaY;

			// init with start or end values if scroll is not possible
			if (this.scrollPosition < 0) {
				this.scrollPosition = 1;
			} else if (this.scrollPosition > maxScrollLeft) {
				this.scrollPosition = maxScrollLeft;
			}

			// emit the event to other graph
			this.scrollPositionChanged.emit(this.scrollPosition);

		}

	}

}
