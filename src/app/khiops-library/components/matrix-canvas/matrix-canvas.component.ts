import {
	Component,
	SimpleChanges,
	HostListener,
	OnChanges,
	Output,
	EventEmitter,
	OnInit,
	Input,
	NgZone,
	ViewChild,
	ElementRef,
	AfterViewInit
} from '@angular/core';
import {
	SelectableService
} from '../selectable/selectable.service';
import {
	SelectableComponent
} from '../selectable/selectable.component';
import _ from 'lodash';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';
import * as panzoom from 'pan-zoom';
import {
	UtilsService
} from '../../providers/utils.service';
import {
	MatrixCanvasService
} from './matrix-canvas.service';
import {
	CellVO
} from '../../model/cell-vo';
import {
	ConfigService
} from '@khiops-library/providers/config.service';
import {
	AppConfig
} from 'src/environments/environment';

@Component({
	selector: 'kl-matrix-canvas',
	templateUrl: './matrix-canvas.component.html',
	styleUrls: ['./matrix-canvas.component.scss']
})
export class MatrixCanvasComponent extends SelectableComponent implements OnChanges {

	@Input() inputDatas: any;
	@Input() minMaxValues: any;
	@Input() graphType: any;
	@Input() graphMode: any;
	@Input() conditionalOnContext: any;
	@Input() graphTargets: any;
	@Input() graphTarget: any;
	@Input() selectedNodes: any; // KC use case
	@Input() selectedCell: any; // KV use case
	@Input() contextSelection: any;
	@Input() isAxisInverted: boolean;
	@Input() variable: any;

	@Output() matrixAxisInverted: EventEmitter < any > = new EventEmitter();
	@Output() cellSelected: EventEmitter < any > = new EventEmitter();
	@Output() cellSelectedByEvent: EventEmitter < any > = new EventEmitter();

	isKhiopsCovisu: boolean = this.khiopsLibraryService.isKhiopsCovisu();

	contrast = parseInt(localStorage.getItem(this.khiopsLibraryService.getAppConfig().common.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST'), 10) ||
		this.khiopsLibraryService.getAppConfig().common.GLOBAL.MATRIX_CONTRAST;

	componentType = 'matrix'; // needed to copy datas

	// panZoom: SvgPanZoom.Instance;
	xAxisLabel: string;
	yAxisLabel: string;
	tooltipText: string;
	legend: {
		min: number,
		max: number
	};
	selectedTargetIndex = -1;
	isZerosToggled = false;
	matrixValues: any;
	globalMatrixValues: any;
	matrixFreqsValues: any;
	matrixExpectedFreqsValues: any;
	loadingMatrixSvg = true;
	isFirstResize = true;
	@ViewChild('matrixDiv', {
		static: false
	}) matrixDiv: ElementRef < HTMLCanvasElement > ;
	matrixCtx: any;
	@ViewChild('matrixSelectedDiv', {
		static: false
	}) matrixSelectedDiv: ElementRef < HTMLCanvasElement > ;
	matrixSelectedCtx: any;
	@ViewChild('matrixArea', {
		static: false
	}) matrixArea: ElementRef < HTMLElement > ;
	@ViewChild('matrixCanvasComp', {
		static: false
	}) matrixCanvasComp: ElementRef < HTMLElement > ;
	@ViewChild('matrixContainerDiv', {
		static: false
	}) matrixContainerDiv: ElementRef < HTMLElement > ;
	@ViewChild('legendBar', {
		static: false
	}) legendBar: ElementRef < HTMLElement > ;
	numberPrecision: any;
	zoom = 1;
	unpanzoom: any;
	disableClick = false;

	isPaning = false;

	tooltipCell: any;
	tooltipPosition: {
		x: number,
		y: number;
	};
	currentEvent: any;
	zoomFactor = 0.5;
	lastScrollPosition: {
		scrollLeft: number,
		scrollTop: number
	};
	currentMouseX: number;
	currentMouseY: number;
	selectedCells: any;
	matrixExtras: any;
	canvasPattern: any;
	isDrawing = false;

	constructor(public selectableService: SelectableService,
		private khiopsLibraryService: KhiopsLibraryService,
		public ngzone: NgZone,
		public configService: ConfigService
	) {
		super(selectableService, ngzone, configService);

		this.lastScrollPosition = {
			scrollLeft: 0,
			scrollTop: 0
		};
		this.numberPrecision = this.khiopsLibraryService.getAppConfig().common.GLOBAL.TO_FIXED;

		this.legend = {
			min: 0,
			max: 0
		};

	}

	@HostListener('window:resize', ['$event'])
	sizeChange(event) {
		if (!this.isFirstResize) {
			this.drawMatrix();
		}
	}

	@HostListener('window:keyup', ['$event'])
	keyEvent(event) {
		const currentSelectedArea = this.selectableService.getSelectedArea();
		if (currentSelectedArea && currentSelectedArea.id === this.id && this.selectedCells.length === 1) {
			const changeCell = MatrixCanvasService.getNavigationCell(
				event.keyCode,
				this.inputDatas.matrixCellDatas,
				this.isAxisInverted,
				this.selectedCells[0].index,
				this.inputDatas.variable
			);
			if (changeCell) {
				this.cellSelected.emit({
					datas: changeCell,
					stopPropagation: true
				});
			}
		} else {
			return;
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// if graph mode change, reset isZerosToggled
		if (changes.graphMode) {
			this.isZerosToggled = false;
		}

		// Draw matrix on change
		if (this.matrixDiv && this.matrixDiv.nativeElement) {
			this.drawMatrix();
		}
	}

	drawMatrix() {

		if (!this.isDrawing) {
			this.isDrawing = true;
			requestAnimationFrame(() => {

				if (this.graphMode && this.inputDatas && this.inputDatas.variable && this.inputDatas.matrixCellDatas) {
					const t2 = performance.now();

					if (this.graphTargets && this.graphTarget) {
						this.selectedTargetIndex = this.graphTargets.indexOf(this.graphTarget);
					} else {
						this.selectedTargetIndex = -1;
					}

					[this.matrixFreqsValues, this.matrixValues, this.globalMatrixValues, this.matrixExtras, this.matrixExpectedFreqsValues] = MatrixCanvasService.computeMatrixValues(
						this.graphMode,
						this.inputDatas,
						this.contextSelection,
						this.selectedTargetIndex);

					// Clean dom canvas
					this.cleanDomContext();
					this.cleanSelectedDomContext();

					if (this.matrixDiv && this.matrixArea) {

						// call to remove panzoom handler from the target
						// it doesn't seem to work ...
						// if (this.unpanzoom) {
						// 	this.unpanzoom();
						// }
						let [width, height] = this.getZoomDimensions();

						this.matrixCtx.canvas.width = width;
						this.matrixCtx.canvas.height = height;
						this.matrixSelectedCtx.canvas.width = width;
						this.matrixSelectedCtx.canvas.height = height;

						if (this.isAxisInverted) {
							[width, height] = [height, width];
						}

						if (this.inputDatas.matrixCellDatas) {
							let minVal, maxVal;
							let minValH, maxValH;

							if (!this.minMaxValues) {
								// GLOBAL.GLOBAL For KC purpose
								if (this.conditionalOnContext && this.graphMode.mode !== 'PROB_CELL' && this.graphMode.mode !== 'PROB_CELL_REVERSE') {
									[minVal, maxVal] = UtilsService.getMinAndMaxFromArray(this.globalMatrixValues);
								} else {
									// Always local if no context
									[minVal, maxVal] = UtilsService.getMinAndMaxFromArray(this.matrixValues);
								}

								if (this.graphMode.mode === 'MUTUAL_INFO') {
									[minVal, maxVal] = UtilsService.averageMinAndMaxValues(minVal, maxVal);
								}
								if (this.graphMode.mode === 'HELLINGER') {
									// For KC purpose
									[minValH, maxValH] = UtilsService.getMinAndMaxFromArray(this.matrixExtras);
									[minValH, maxValH] = UtilsService.averageMinAndMaxValues(minVal, maxVal);
								}
							} else {
								// For KV purpose
								[minVal, maxVal] = this.minMaxValues[this.graphMode.mode];
							}

							if (this.graphMode.mode === 'HELLINGER') {
								// For KC purpose
								this.legend.min = minValH;
								this.legend.max = maxValH;
							} else {
								this.legend.min = minVal;
								this.legend.max = maxVal;
							}
							if (this.legend.min > 0) {
								this.legend.min = 0;
							}

							this.xAxisLabel = this.inputDatas.variable.nameX;
							this.yAxisLabel = this.inputDatas.variable.nameY;

							if (this.isAxisInverted) {
								[this.xAxisLabel, this.yAxisLabel] = [this.yAxisLabel, this.xAxisLabel];
							} else {
								this.matrixCtx.translate(0, height);
								this.matrixCtx.scale(1, -1);
								this.matrixSelectedCtx.translate(0, height);
								this.matrixSelectedCtx.scale(1, -1);
							}

							this.updateLegendBar();
							if (this.isAxisInverted) {
								this.matrixCtx.translate(0, width);
								this.matrixCtx.scale(-1, -1);
								this.matrixCtx.rotate(Math.PI / 2);
								this.matrixSelectedCtx.translate(0, width);
								this.matrixSelectedCtx.scale(-1, -1);
								this.matrixSelectedCtx.rotate(Math.PI / 2);
							}

							this.selectedCells = [];
							if (this.selectedCell) { // null for KC
								this.selectedCells.push(this.selectedCell);
							}

							// Compute totlal mutual info
							const totalMutInfo = this.graphMode.mode === 'MUTUAL_INFO' ? UtilsService.arraySum(this.matrixValues) : 0;

							const cellsLength = this.inputDatas.matrixCellDatas.length;
							this.matrixCtx.beginPath();
							this.matrixCtx.strokeStyle = 'rgba(255,255,255,0.3)';
							this.matrixCtx.lineWidth = 1;
							for (let index = 0; index < cellsLength; index++) {

								if (this.graphMode.mode === 'MUTUAL_INFO' && this.isKhiopsCovisu) { // hide zero exeptions do not work anymore #110
									this.matrixExtras[index] = totalMutInfo;
								}

								const cellDatas = this.inputDatas.matrixCellDatas[index];

								this.adaptCellDimensionsToZoom(cellDatas, width, height, this.graphType);

								const currentVal = this.matrixValues[index];
								cellDatas.displayedValue = {
									type: this.graphMode.mode,
									value: currentVal,
									ef: this.matrixExpectedFreqsValues[index],
									extra: this.matrixExtras && this.matrixExtras[index] || 0
								};
								cellDatas.displayedFreqValue = this.matrixFreqsValues[index];
								const color = this.getColorForPercentage(currentVal, maxVal);

								this.matrixCtx.fillStyle = color;
								const {
									xCanvas,
									yCanvas,
									wCanvas,
									hCanvas
								} = cellDatas;
								this.matrixCtx.fillRect(xCanvas, yCanvas, wCanvas, hCanvas);

								// Draw pattern if 0 is an exception
								if (this.matrixExtras ?. [index] && this.isZerosToggled) {
									this.drawProbExceptionCell(cellDatas);
								}

							}
							this.matrixCtx.stroke();
							this.drawSelectedNodes();

						}

						if (!this.unpanzoom) {
							this.unpanzoom = panzoom(this.matrixContainerDiv.nativeElement, e => {
								if (e.dz) {
									// this.zoomCanvas(e.dz);
									if (e.dz > 0) {
										this.onClickOnZoomOut();
									} else {
										this.onClickOnZoomIn();
									}
								} else {
									if (e.dx !== 0 || e.dy !== 0) {
										this.matrixArea.nativeElement.scrollLeft = this.matrixArea.nativeElement.scrollLeft - e.dx;
										this.matrixArea.nativeElement.scrollTop = this.matrixArea.nativeElement.scrollTop - e.dy;

										this.lastScrollPosition = {
											scrollLeft: this.matrixArea.nativeElement.scrollLeft,
											scrollTop: this.matrixArea.nativeElement.scrollTop
										};
									}
								}
								if (this.zoom !== 1) {
									this.isPaning = true;
								}

								// setTimeout(() => {
								// 	this.isPaning = false;
								// }, 100);
							});
						}

						setTimeout(() => {
							this.loadingMatrixSvg = false;
							if (this.isFirstResize) {
								this.isFirstResize = false;
							}
						}, 100);

					}

					this.matrixSelectedDiv.nativeElement.addEventListener('click', (event) => {
						if (!this.disableClick) {
							// Do not alllow multiple click on matrix to avoid loops
							this.disableClick = true;
							setTimeout(() => {
								this.disableClick = false;
							}, 500);
							this.clickOnCell(event);
						}
					}, {
						passive: true
					});

					this.matrixSelectedDiv.nativeElement.addEventListener('mouseout', (event) => {
						this.hideTooltip();
					}, {
						passive: true
					});

					this.matrixSelectedDiv.nativeElement.addEventListener('mousemove', (event) => {
						this.currentEvent = event;
						this.showTooltip(event);
					}, {
						passive: true
					});

					this.matrixSelectedDiv.nativeElement.addEventListener('wheel', (event) => {
						// Keep event in memory to manage zoom factor on scroll
						this.currentEvent = event;
					}, {
						passive: true
					});

					this.matrixArea.nativeElement.addEventListener('scroll', (event: any) => {
						this.lastScrollPosition = {
							scrollLeft: event.target.scrollLeft,
							scrollTop: event.target.scrollTop
						};
					}, {
						passive: true
					});
					this.isDrawing = false;
					const t3 = performance.now();
					console.log('Draw matrix performance' + (t3 - t2) + ' milliseconds.');
				}
			});


		}


	}

	clickOnCell(event) {
		// Hack to prevent event emit if user pan matrix
		if (!this.isPaning || this.isPaning === undefined) {
			this.isPaning = false;
			this.cleanSelectedDomContext();

			const clicked = this.getCurrentCell(event);
			this.drawSelectedCell(clicked);

			setTimeout(() => {
				this.cellSelected.emit({
					datas: clicked
				});
			});
		} else {
			this.isPaning = false;
		}
	}

	drawSelectedNodes() {
		this.cleanSelectedDomContext();
		this.selectedCells = []
		const cellsLength = this.inputDatas.matrixCellDatas.length;
		for (let index = 0; index < cellsLength; index++) {
			const cellDatas = this.inputDatas.matrixCellDatas[index];
			// Manage selected cell (different for KV and KC)
			if (this.selectedNodes ?. [0] ?.childrenList.includes(cellDatas.xaxisPart) &&
				this.selectedNodes ?. [1] ?.childrenList.includes(cellDatas.yaxisPart)) {
				this.selectedCells.push(cellDatas);
			}
		}

		for (const cell of this.selectedCells) {
			// Draw selected cells after other to be above
			this.drawSelectedCell(cell);
		}
	}

	drawSelectedCell(cell: CellVO) {

		if (cell) {
			this.matrixSelectedCtx.strokeStyle = '#ffffff';
			this.matrixSelectedCtx.lineWidth = 4;
			this.matrixSelectedCtx.shadowBlur = 1;
			this.matrixSelectedCtx.shadowColor = 'white';
			this.matrixSelectedCtx.strokeRect(cell.xCanvas, cell.yCanvas, cell.wCanvas, cell.hCanvas);

			this.matrixSelectedCtx.lineWidth = 2;
			this.matrixSelectedCtx.strokeStyle = '#57689d';
			this.matrixSelectedCtx.strokeRect(cell.xCanvas, cell.yCanvas, cell.wCanvas, cell.hCanvas);
		}
	}

	drawProbExceptionCell(cell: CellVO) {
		if (!this.canvasPattern) {
			this.drawZeroExceptionCanvasPattern();
		}
		this.matrixCtx.fillStyle = this.matrixCtx.createPattern(this.canvasPattern, 'repeat');
		this.matrixCtx.fillRect(cell.xCanvas, cell.yCanvas, cell.wCanvas, cell.hCanvas);
	}

	drawZeroExceptionCanvasPattern() {
		this.canvasPattern = document.createElement('canvas');
		this.canvasPattern.width = 16;
		this.canvasPattern.height = 16;
		const pctx = this.canvasPattern.getContext('2d');

		const x0 = 32;
		const x1 = -1;
		const y0 = -1;
		const y1 = 32;
		const offset = 16;

		pctx.strokeStyle = '#57689d';
		pctx.lineWidth = 1;
		pctx.beginPath();
		pctx.moveTo(x0, y0);
		pctx.lineTo(x1, y1);
		pctx.moveTo(x0 - offset, y0);
		pctx.lineTo(x1 - offset, y1);
		pctx.moveTo(x0 + offset, y0);
		pctx.lineTo(x1 + offset, y1);
		pctx.stroke();
	}

	/**
	 * Before draw canvas, clean dom and clone divs to remove listeners
	 */
	cleanDomContext() {

		// this.matrixArea = document.getElementById('matrix-area');
		// this.matrixContainerDiv = document.getElementById('matrix-container');
		// this.matrixCanvasComp = document.getElementById('matrix-canvas-comp');

		// Clone to remove listeners
		// const matrixDiv = document.getElementById('matrix');
		if (this.matrixDiv) {
			// const matrixDiv = this.matrixDiv.nativeElement.cloneNode(true);
			// matrixDiv.parentNode.replaceChild(this.matrixDiv.nativeElement, matrixDiv);

			this.matrixCtx = this.matrixDiv.nativeElement.getContext('2d');

			// clear the canvas for redrawing
			this.matrixCtx.clearRect(0, 0, this.matrixDiv.nativeElement.width, this.matrixDiv.nativeElement.height);
		}
	}

	cleanSelectedDomContext() {
		if (this.matrixSelectedDiv) {
			this.matrixSelectedCtx = this.matrixSelectedDiv.nativeElement.getContext('2d');
			// clear the canvas for redrawing
			this.matrixSelectedCtx.clearRect(0, 0, this.matrixSelectedDiv.nativeElement.width, this.matrixSelectedDiv.nativeElement.height);
		}
	}

	zoomCanvas(delta, preventTranslate = false) {

		const previousZoom = this.zoom;
		if (delta < 0) {
			this.zoom = this.zoom + this.zoomFactor;
			// this.zoom = this.zoom + 2;
		} else if (delta > 0) {
			this.zoom = this.zoom - this.zoomFactor;
			// this.zoom = this.zoom - 2;
		} else if (delta === 0) {
			this.zoom = 0;
		}
		if (this.zoom < 1) {
			this.zoom = 1;
		}
		if (this.zoom > 15) {
			this.zoom = 15;
		}
		if (previousZoom !== this.zoom) {
			this.zoom = Number(this.zoom.toFixed(1));

			const containerPosition = this.matrixArea.nativeElement.getBoundingClientRect();
			this.currentMouseY = Math.round(this.currentEvent.y - containerPosition.top);
			this.currentMouseX = Math.round(this.currentEvent.x - containerPosition.left);

			this.drawMatrix();

			let deltaX = 0;
			let deltaY = 0;
			if (previousZoom !== 1) {
				deltaX = (this.currentMouseX - this.lastScrollPosition.scrollLeft) / previousZoom;
				deltaY = (this.currentMouseY - this.lastScrollPosition.scrollTop) / previousZoom;
			} else {

			}

			deltaX = deltaX + 10; // 10 for scrollbars
			deltaY = deltaY + 10;

			if (!preventTranslate) {
				this.matrixArea.nativeElement.scrollLeft = (this.currentMouseX * this.zoom) - this.currentMouseX - deltaX;
				this.matrixArea.nativeElement.scrollTop = (this.currentMouseY * this.zoom) - this.currentMouseY - deltaY;
			}

			this.lastScrollPosition = {
				scrollLeft: this.currentMouseX,
				scrollTop: this.currentMouseY
			};

			this.currentMouseY = 0;
			this.currentMouseX = 0;

		}
	}

	updateLegendBar() {
		if (!this.legendBar.nativeElement) return;
		// const dom = document.getElementById('legend-bar');
		if (this.graphMode.mode === 'MUTUAL_INFO' || this.graphMode.mode === 'HELLINGER' ||
			this.graphMode.mode === 'MUTUAL_INFO_TARGET_WITH_CELL') {
			this.legendBar.nativeElement.style.background = MatrixCanvasService.getInterestColorsLegend();
		} else {
			this.legendBar.nativeElement.style.background = MatrixCanvasService.getFrequencyColorsLegend();
		}
	}

	getColorForPercentage(currentColorVal, maxVal) {

		let colorValue = 0;
		const A = this.contrast;
		const cste = 0.1;
		const P = Math.exp(Math.log(cste) / 100);
		const c = Math.pow(P, A);

		if (currentColorVal >= 0) {
			colorValue = Math.pow((currentColorVal / maxVal), c);
		} else {
			colorValue = -(Math.pow((-currentColorVal / maxVal), c));
		}

		if (currentColorVal === 0) {
			return 'white';
		} else {
			let percentColors;
			if (this.graphMode.mode === 'MUTUAL_INFO' || this.graphMode.mode === 'HELLINGER' ||
				this.graphMode.mode === 'MUTUAL_INFO_TARGET_WITH_CELL') {
				const isPositiveValue = colorValue >= 0 ? true : false;
				percentColors = MatrixCanvasService.getInterestColors(isPositiveValue);
				colorValue = Math.abs(colorValue);
			} else {
				percentColors = MatrixCanvasService.getFrequencyColors();
			}

			let i = 1;
			for (i; i < percentColors.length - 1; i++) {
				if (colorValue < percentColors[i].pct) {
					break;
				}
			}
			const lower = percentColors[i - 1];
			const upper = percentColors[i];
			const range = upper.pct - lower.pct;
			const rangePct = (colorValue - lower.pct) / range;
			const pctLower = 1 - rangePct;
			const pctUpper = rangePct;
			const color = {
				r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
				g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
				b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
			};
			const rgba = 'rgba(' + [color.r, color.g, color.b, 1].join(',') + ')';
			return rgba;
		}
	}

	getZoomDimensions() {

		if (this.zoom === 1) {
			this.matrixArea.nativeElement.style.overflow = 'hidden';
		} else {
			this.matrixArea.nativeElement.style.overflow = 'scroll';
		}
		let width = this.matrixContainerDiv.nativeElement.clientWidth;
		let height = this.matrixContainerDiv.nativeElement.clientHeight;

		width = width * this.zoom;
		height = height * this.zoom;

		width = Number(width.toFixed(0));
		height = Number(height.toFixed(0));

		return [width, height];
	}

	adaptCellDimensionsToZoom(cellDatas, width, height, graphType) {

		if (graphType === 'GLOBAL.STANDARD') {
			cellDatas.xCanvas = cellDatas.x.standard * width / 100;
			cellDatas.yCanvas = cellDatas.y.standard * height / 100;
			cellDatas.wCanvas = cellDatas.w.standard * width / 100;
			cellDatas.hCanvas = cellDatas.h.standard * height / 100;
		} else {
			cellDatas.xCanvas = cellDatas.x.frequency * width / 100;
			cellDatas.yCanvas = cellDatas.y.frequency * height / 100;
			cellDatas.wCanvas = cellDatas.w.frequency * width / 100;
			cellDatas.hCanvas = cellDatas.h.frequency * height / 100;
		}

		return cellDatas;
	}

	getCurrentCell(event) {

		if (this.inputDatas) {
			const canvasPosition = this.matrixDiv.nativeElement.getBoundingClientRect();
			let x = event.pageX - canvasPosition.left;
			let y = event.pageY - canvasPosition.top;

			if (this.isAxisInverted) {
				[x, y] = [y, x];
				x = canvasPosition.height - x;
			} else {
				y = canvasPosition.height - y;
			}

			const cellsLength = this.inputDatas.matrixCellDatas.length;
			for (let i = 0; i < cellsLength; i++) {
				if (y > this.inputDatas.matrixCellDatas[i].yCanvas &&
					y < this.inputDatas.matrixCellDatas[i].yCanvas + this.inputDatas.matrixCellDatas[i].hCanvas &&
					x > this.inputDatas.matrixCellDatas[i].xCanvas &&
					x < this.inputDatas.matrixCellDatas[i].xCanvas + this.inputDatas.matrixCellDatas[i].wCanvas) {
					return this.inputDatas.matrixCellDatas[i];
				}
			}
		}

	}

	onContrastChanged(event) {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_contrast', event.value);
		this.contrast = event.value;
		localStorage.setItem(AppConfig.visualizationCommon.GLOBAL.LS_ID + 'SETTING_MATRIX_CONTRAST', this.contrast.toString());
		this.drawMatrix();
	}

	onClickOnInvertAxis() {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_inverted');
		this.isAxisInverted = !this.isAxisInverted;
		this.drawMatrix();
		this.matrixAxisInverted.emit();
	}

	onClickOnToggleZeros() {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_toggle_zeros');
		this.isZerosToggled = !this.isZerosToggled;
		this.drawMatrix();
	}

	showTooltip(event) {
		this.tooltipCell = this.getCurrentCell(event);
		const x = event.pageX;
		const y = event.pageY;
		this.tooltipPosition = {
			x: x,
			y: y
		};
	}

	hideTooltip() {
		this.tooltipCell = undefined;
	}

	onClickOnZoomIn() {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_zoom', 'in');
		this.currentMouseY = 0;
		this.currentMouseX = 0;
		this.zoomCanvas(-1, true);
	}

	onClickOnZoomOut() {
		// this.khiopsLibraryService.trackEvent('click', 'matrix_zoom', 'out');
		this.currentMouseY = 0;
		this.currentMouseX = 0;
		this.zoomCanvas(1, true);
	}

	onClickOnResetZoom() {
		this.currentMouseY = 0;
		// this.khiopsLibraryService.trackEvent('click', 'matrix_zoom', 'reset');
		this.currentMouseX = 0;
		this.zoomCanvas(0);
	}

}
