export class NoteVO {

	id: number;
	name: string;
	body: string;
	prerelease: boolean;
	published_at: string;

	constructor(data) {
		this.id = data.id;
		this.name = data.name;
		this.body = data.body;
		this.prerelease = data.prerelease;
		this.published_at = data.published_at;
	}

}
