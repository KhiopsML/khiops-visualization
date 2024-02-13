import { Injectable } from "@angular/core";
import pjson from "package.json";

@Injectable({
	providedIn: "root",
})
export class LibVersionService {
	constructor() {}

	static getVersion() {
		return (pjson && pjson.version) || undefined;
	}
}
