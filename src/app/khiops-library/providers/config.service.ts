import { ConfigModel } from './../model/config.model';
import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

	private appRootElement: ElementRef<HTMLElement>;

	config: ConfigModel = new ConfigModel();

	setRootElement(appRoot) {
		this.appRootElement = appRoot;
	}

	getRootElement() {
		return this.appRootElement;
	}

	getRootElementDom() {
		return this.appRootElement.nativeElement;
	}

}
