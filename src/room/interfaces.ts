export interface Marker {
	id: string;
	pos: [number, number];
	color: string;
	ownerId: string;
}

export interface Token {
	id: string;
	pos: [number, number];
	rotation: number;
	ownerId: string;
	imgUrl: string;
	type: string;
	status: string;
	size: number;
}

export interface UserInfos {
	id: string;
	name: string;
	color: string;
}

export interface MapData {
	id?: string;
	name: string;
	date: number;
	url: string;
}
