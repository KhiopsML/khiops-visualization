import {
	Component,
	Input,
	OnChanges,
	SimpleChanges,
	ChangeDetectionStrategy,
	ViewChild,
	ElementRef,
} from "@angular/core";
import { CellVO } from "@khiops-library/model/cell-vo";

@Component({
	selector: "kl-matrix-tooltip",
	templateUrl: "./matrix-tooltip.component.html",
	styleUrls: ["./matrix-tooltip.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatrixTooltipComponent implements OnChanges {
	@Input() cell: CellVO;
	@Input() matrixSize: number[];
	@Input() position: {
		x: number;
		y: number;
	};
	@ViewChild("matrixTooltipDiv") matrixTooltipDiv: ElementRef<HTMLElement>;

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (
			this.matrixTooltipDiv &&
			this.matrixTooltipDiv.nativeElement &&
			changes.position &&
			changes.position.currentValue
		) {
			if (this.position.x < 400) {
				this.matrixTooltipDiv.nativeElement.style.left =
					this.position.x + 40 + "px";
			} else {
				this.matrixTooltipDiv.nativeElement.style.left =
					this.position.x - 340 + "px";
			}
			this.matrixTooltipDiv.nativeElement.style.top =
				this.position.y - 100 + "px";
		}
		if (
			this.matrixTooltipDiv &&
			this.matrixTooltipDiv.nativeElement &&
			changes.cell
		) {
			if (changes.cell.currentValue) {
				this.matrixTooltipDiv.nativeElement.style.visibility =
					"visible";
			} else {
				this.matrixTooltipDiv.nativeElement.style.visibility = "hidden";
			}
		}
	}
}
