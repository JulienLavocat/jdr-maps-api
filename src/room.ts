import { nanoid } from "nanoid";

const COLORS = [
	"black",
	"blue",
	"gold",
	"grey",
	"orange",
	"red",
	"violet",
	"yellow",
];

export default class Room {
	roomId: string;
	colors: string[];
	markers: { id: string; pos: [number, number]; color: string }[];

	constructor(roomId: string) {
		this.roomId = roomId;
		this.colors = [...COLORS];
		this.markers = [];
	}

	addMarker(pos: [number, number], color: string) {
		this.markers.push({ id: nanoid(), pos, color });
	}

	removeMarker(id: string) {
		this.markers = this.markers.filter((e) => e.id !== id);
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift();
	}
}
