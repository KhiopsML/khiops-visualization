import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ChangeDetectionStrategy,
	OnInit,
	ViewChild,
	ElementRef
} from '@angular/core';

@Component({
	selector: 'kl-matrix-tooltip',
	templateUrl: './matrix-tooltip.component.html',
	styleUrls: ['./matrix-tooltip.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatrixTooltipComponent implements OnInit, OnChanges {

	@Input() cell: any;
	@Input() matrixSize: any;
	@Input() position: any;
	@ViewChild('matrixTooltipDiv') matrixTooltipDiv: ElementRef<HTMLElement>;

	constructor() {}

	ngOnInit() {
		// this.matrixTooltipDiv = document.getElementById('matrix-tooltip-comp');
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.matrixTooltipDiv && this.matrixTooltipDiv.nativeElement && changes.position && changes.position.currentValue) {
			this.matrixTooltipDiv.nativeElement.style.top = this.position.y - 100 + 'px';
			this.matrixTooltipDiv.nativeElement.style.left = this.position.x - 340 + 'px';
		}
		if (this.matrixTooltipDiv && this.matrixTooltipDiv.nativeElement && changes.cell) {
			if (changes.cell.currentValue) {
				this.matrixTooltipDiv.nativeElement.style.visibility = 'visible';
			} else {
				this.matrixTooltipDiv.nativeElement.style.visibility = 'hidden';
			}
		}

	}

}
