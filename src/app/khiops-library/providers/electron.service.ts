import {
	Injectable
} from '@angular/core';
import {
	ipcRenderer,
	webFrame,
	// remote
} from 'electron';
import * as childProcess from 'child_process';
// import * as fs from 'fs';
let fs: any;
try {
	fs = require('fs');
} catch (e) {
	console.warn(e);
}

@Injectable({
	providedIn: 'root'
})
export class ElectronService {

	ipcRenderer: typeof ipcRenderer;
	webFrame: typeof webFrame;
	// remote: any;
	childProcess: typeof childProcess;
	fs: typeof fs;

	constructor() {
		// Conditional imports
		if (this.isElectron()) {
			// this.ipcRenderer = window.require('electron').ipcRenderer;
			// this.webFrame = window.require('electron').webFrame;
			// this.remote = window.require('@electron/remote');
			// this.childProcess = require('@electron/remote').require('child_process');
			// this.fs = require('@electron/remote').require('fs');

			this.ipcRenderer = window.require('electron').ipcRenderer;
			this.webFrame = window.require('electron').webFrame;

			this.childProcess = window.require('child_process');
			this.fs = window.require('fs');

		}
	}

	isElectron = () => {
		return !!(window && window.process && window.process.type);
	}

}
