import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ChangeDetectionStrategy,
	OnInit
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
	matrixTooltipDiv: any;

	constructor() {}

	ngOnInit() {
		this.matrixTooltipDiv = document.getElementById('matrix-tooltip-comp');
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.matrixTooltipDiv && changes.position && changes.position.currentValue) {
			this.matrixTooltipDiv.style.top = this.position.y - 100 + 'px';
			this.matrixTooltipDiv.style.left = this.position.x - 380 + 'px';
		}
		if (this.matrixTooltipDiv && changes.cell) {
			if (changes.cell.currentValue) {
				this.matrixTooltipDiv.style.visibility = 'visible';
			} else {
				this.matrixTooltipDiv.style.visibility = 'hidden';
			}
		}

	}

}
