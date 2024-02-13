export class TrainedPredictorVO {
	_id: string;
	name: string;
	level: number;
	weight: number;
	importance: number;
	map: string;

	constructor(object, availableKeys) {
		// Generate id for grid
		this._id = object.name;

		this.name = object.name;

		// Do not add into VO datas that are not defined into avaliable keys
		// We do that because VO is different when user change "select train predictor"
		if (availableKeys.includes("level")) {
			this.level = object.level || "";
		}
		if (availableKeys.includes("weight")) {
			this.weight = object.weight || "";
		}
		if (availableKeys.includes("map")) {
			this.map = object.map || "";
		}
		if (availableKeys.includes("importance")) {
			this.importance = object.importance || "";
		}
	}
}
