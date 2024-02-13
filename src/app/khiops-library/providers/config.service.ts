import { ConfigModel } from "./../model/config.model";
import { ElementRef, Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class ConfigService {
	private appRootElement: ElementRef<HTMLElement>;

	private config: ConfigModel = new ConfigModel();

	setRootElement(appRoot) {
		this.appRootElement = appRoot;
	}

	getRootElement() {
		return this.appRootElement;
	}

	getRootElementDom() {
		return this.appRootElement.nativeElement;
	}

	setConfig(config: ConfigModel) {
		this.config = config;
	}

	getConfig(): ConfigModel {
		return this.config;
	}
}
