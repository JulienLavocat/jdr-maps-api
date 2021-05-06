import { nanoid } from "nanoid";
import { Socket, Server as IO } from "socket.io";

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

export interface Marker {
	id: string;
	pos: [number, number];
	color: string;
	ownerId: string;
}

export default class Room {
	roomId: string;
	colors: string[];
	markers: Marker[];
	io: IO;

	constructor(roomId: string, io: IO) {
		this.roomId = roomId;
		this.colors = [...COLORS];
		this.markers = [];
		this.io = io;
	}

	onJoin(socket: Socket) {
		this.log(`${socket.id} joined ${this.roomId}`);
		socket.to(this.roomId).emit("room_joined", {
			id: socket.id,
			color: this.getColor(),
			markers: this.markers,
		});
	}

	onLeave(socketId: string) {
		console.log("Removing marker of " + socketId);
		this.updateMarkers(this.markers.filter((e) => e.ownerId !== socketId));
	}

	addMarker(socketId: string, pos: [number, number], color: string) {
		this.log(`${socketId} added marker at ${pos}`);
		this.markers.push({ id: nanoid(), pos, color, ownerId: socketId });
		this.updateMarkers();
	}

	removeMarker(socketId: string, markerId: string) {
		this.log(`${socketId} removed market ${markerId}`);
		this.updateMarkers(this.markers.filter((e) => e.id !== markerId));
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift();
	}

	updateMarkers(markers?: Marker[]) {
		if (markers) this.markers = markers;
		this.io.to(this.roomId).emit("markers_updated", this.markers);
	}

	log(msg: string) {
		console.log(`[${this.roomId}] ${msg}`);
	}
}
