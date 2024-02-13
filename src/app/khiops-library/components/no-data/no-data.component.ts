import { Component, Input, OnInit } from "@angular/core";
import { TranslateService } from "@ngstack/translate";

@Component({
	selector: "kl-no-data",
	templateUrl: "./no-data.component.html",
})
export class NoDataComponent implements OnInit {
	@Input() message: string;

	constructor(private translate: TranslateService) {}

	ngOnInit() {
		if (!this.message) {
			this.message = this.translate.get("NO_DATAS.DEFAULT");
		} else {
			this.message = this.translate.get(this.message);
		}
	}
}
