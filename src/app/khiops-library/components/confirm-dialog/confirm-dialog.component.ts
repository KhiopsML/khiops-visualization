import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngstack/translate";

@Component({
	selector: "kl-confirm-dialog",
	templateUrl: "./confirm-dialog.component.html",
})
export class ConfirmDialogComponent implements OnInit {
	title: string;
	message: string;
	displayRejectBtn: boolean = false;
	displayCancelBtn: boolean = true;
	confirmTranslation: string;

	confirmButtonText: string = this.translate.get("GLOBAL.YES");

	constructor(private translate: TranslateService) {}

	ngOnInit() {
		if (this.confirmTranslation) {
			this.confirmButtonText = this.confirmTranslation;
		}
	}
}
