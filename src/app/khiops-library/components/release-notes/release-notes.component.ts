import {
	Component,
	OnInit
} from '@angular/core';
import {
	ReleaseNotesService
} from './release-notes.service';
import {
	MatSnackBar
} from '@angular/material/snack-bar';
import {
	TranslateService
} from '@ngstack/translate';

@Component({
	selector: 'kl-release-notes',
	templateUrl: './release-notes.component.html',
	styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent implements OnInit {
	releaseNotesDatas: any;
	loadingNotes = true;
	loadingNotesError = false;

	constructor(private releaseNotesService: ReleaseNotesService,
		private snackBar: MatSnackBar,
		public translate: TranslateService) {}

	ngOnInit() {

		this.releaseNotesService.loadGithubReleaseNotes().then(datas => {
			this.loadingNotes = false;
			this.releaseNotesDatas = datas;
		}).catch(error => {
			this.loadingNotes = false;
			this.loadingNotesError = true;
			this.snackBar.open(this.translate.get('SNACKS.OPEN_RELEASE_NOTES_ERROR'), null, {
				duration: 4000,
				panelClass: 'error'
			});
		});
	}

}
