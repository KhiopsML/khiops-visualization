import {
	Component,
	OnInit,
	Input,
	EventEmitter,
	Output
} from '@angular/core';
import html2canvas from 'html2canvas';
import {
	nativeImage
} from 'electron';
let clipboard: any;
try {
	clipboard = require('electron').clipboard;
} catch (e) {
	console.warn('Can not access Electron clipboard on browser', e);
}
import {
	MatSnackBar
} from '@angular/material/snack-bar';

import {
	SelectableService
} from '../selectable/selectable.service';
import {
	TranslateService
} from '@ngstack/translate';
import {
	HotkeysService,
	Hotkey
} from 'angular2-hotkeys';
import {
	CopyDatasService
} from '../../providers/copy-datas.service';
import {
	KhiopsLibraryService
} from '../../providers/khiops-library.service';

@Component({
	selector: 'kl-header-tools',
	templateUrl: './header-tools.component.html',
	styleUrls: ['./header-tools.component.scss']
})
export class HeaderToolsComponent implements OnInit {

	@Input() appVersion: any;
	@Input() showMenu = true;
	isCopyingImage = false;
	@Output() toggleNavDrawerChanged: EventEmitter < any > = new EventEmitter();
	eltsToHide: any;

	constructor(public selectableService: SelectableService,
		private khiopsLibraryService: KhiopsLibraryService,
		private copyDatasService: CopyDatasService,
		private translate: TranslateService,
		private hotkeysService: HotkeysService,
		private snackBar: MatSnackBar) {

		// define hotkeys
		this.hotkeysService.add(new Hotkey('ctrl+c', (event: KeyboardEvent): boolean => {
			this.copyImage();
			return false; // Prevent bubbling
		}));
		this.hotkeysService.add(new Hotkey('ctrl+d', (event: KeyboardEvent): boolean => {
			this.copyDatas();
			return false; // Prevent bubbling
		}));
	}

	ngOnInit() {}

	copyDatas() {
		// this.khiopsLibraryService.trackEvent('click', 'copy_datas', 'text');

		const currentSelectedArea = this.selectableService.getSelectedArea();

		if (currentSelectedArea) {
			this.copyDatasService.copyDatasToClipboard(currentSelectedArea);

			this.snackBar.open(this.translate.get('SNACKS.DATAS_COPIED'), null, {
				duration: 2000,
				panelClass: 'success'
			});

		} else {
			this.snackBar.open(this.translate.get('SNACKS.NO_AREA_SELECTED'), null, {
				duration: 2000,
				panelClass: 'warning'
			});
		}
	}

	copyImage() {
		// this.khiopsLibraryService.trackEvent('click', 'copy_datas', 'image');

		const currentSelectedArea = this.selectableService.getSelectedArea();

		if (currentSelectedArea) {
			this.isCopyingImage = true;
			setTimeout(() => {
				try {

					let currentDiv: any;
					currentDiv = document.querySelector('#' + currentSelectedArea.id).firstChild;

					this.rePaintGraph(currentDiv);

					// convert div screenshot to canvas
					html2canvas(currentDiv).then(canvas => {
						canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
						const base64data = canvas.toDataURL('image/jpeg');

						const natImage = nativeImage.createFromDataURL(base64data);
						clipboard.writeImage(natImage);

						// Show useless header informations for screenshots when done
						// TODO there is an option into the lib to do that
						// this.eltsToHide = elt.getElementsByClassName('screenshot-hide');
						if (this.eltsToHide && this.eltsToHide[0]) {
							for (let i = 0; i < this.eltsToHide.length; i++) {
								this.eltsToHide[i].style.display = 'flex';
							}
						}
						currentDiv.classList.contains('printing') && currentDiv.classList.remove('printing') && currentDiv.classList.add('selected');
						currentDiv.parentNode.classList.contains('printing') && currentDiv.parentNode.classList.remove('printing') && currentDiv.parentNode.classList.add('selected');

						// Show snack
						this.snackBar.open(this.translate.get('SNACKS.SCREENSHOT_COPIED'), null, {
							duration: 2000,
							panelClass: 'success'
						});

						this.isCopyingImage = false;
						// debug display img
						// var img = document.createElement("img");
						// img.src = base64data;
						// document.body.appendChild(img);

					}).catch((e) => {
						console.error('​HeaderToolsComponent -> copyImage -> e', e);
						this.snackBar.open(this.translate.get('SNACKS.COPY_ERROR') + e, null, {
							duration: 4000,
							panelClass: 'error'
						});
					}).finally(() => {
						this.isCopyingImage = false;
					});
				} catch (e) {
					this.snackBar.open(this.translate.get('SNACKS.COPY_ERROR'), null, {
						duration: 4000,
						panelClass: 'error'
					});
					this.isCopyingImage = false;
				}

			}, 100);

		} else {
			this.snackBar.open(this.translate.get('SNACKS.NO_AREA_SELECTED'), null, {
				duration: 2000,
				panelClass: 'warning'
			});
		}

	}

	rePaintGraph(elt: any) {

		// Remove box shadow to prevent bliue overlay on exported screenshot
		// https://stackoverflow.com/questions/57070074/issue-with-html2canvas-green-overlay-while-exporting
		elt.classList.contains('selected') && elt.classList.remove('selected') && elt.classList.add('printing');
		elt.parentNode.classList.contains('selected') && elt.parentNode.classList.remove('selected') && elt.parentNode.classList.add('printing');

		// Hide useless header informations for screenshots
		this.eltsToHide = elt.getElementsByClassName('screenshot-hide');
		if (this.eltsToHide && this.eltsToHide[0]) {
			for (let i = 0; i < this.eltsToHide.length; i++) {
				this.eltsToHide[i].style.display = 'none';
			}
		}

	}

	toggleSideBar() {
		this.toggleNavDrawerChanged.emit();
	}

}
