import {
	Component,
	Input,
	OnInit
} from '@angular/core';

import {
	MatDialog,
	MatDialogRef,
	MatDialogConfig
} from '@angular/material/dialog';
import {
	ReleaseNotesComponent
} from '../release-notes/release-notes.component';
@Component({
	selector: 'kl-app-version',
	templateUrl: './app-version.component.html',
	styleUrls: ['./app-version.component.scss']
})
export class AppVersionComponent implements OnInit {

	@Input() appVersion: any;

	constructor(private dialog: MatDialog) {}

	ngOnInit() {}

	openReleaseNotesDialog(): void {
		// const config = new MatDialogConfig();
		// const dialogRef: MatDialogRef < ReleaseNotesComponent > = this.dialog.open(ReleaseNotesComponent, config);
		// dialogRef.componentInstance.appVersion = this.appVersion;
	}

}
