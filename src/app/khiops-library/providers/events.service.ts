import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

	clickOpenFile: EventEmitter<any> = new EventEmitter<any>();
	customEvent: EventEmitter<string> = new EventEmitter<string>()

	onClickOpenFile() {
		this.clickOpenFile.emit();
	}

	onCustomEvent(eventName) {
		this.customEvent.emit(eventName);
	}

}
