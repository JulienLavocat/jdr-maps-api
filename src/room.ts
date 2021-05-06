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

export interface Token {
	id: string;
	pos: [number, number];
	ownerId: string;
	imgUrl: string;
	size: number;
}

const DEFAULT_TOKEN_SIZE = 80;

export default class Room {
	roomId: string;
	colors: string[];
	mapUrl: string;
	markers: Marker[];
	tokens: Token[];
	io: IO;

	constructor(roomId: string, io: IO) {
		this.roomId = roomId;
		this.colors = [...COLORS];
		this.markers = [];
		this.tokens = [];
		this.io = io;
		this.mapUrl = "/maps/Garde.jpg";
	}

	onJoin(socket: Socket) {
		this.log(`${socket.id} joined ${this.roomId}`);
		socket.to(this.roomId).emit("room_joined", {
			id: socket.id,
			color: this.getColor(),
			markers: this.markers,
			tokens: this.tokens,
			mapUrl: this.mapUrl,
		});
	}

	onLeave(socketId: string) {
		console.log("Removing marker of " + socketId);
		//this.updateMarkers(this.markers.filter((e) => e.ownerId !== socketId));
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

	addToken(socketId: string, pos: [number, number], imgUrl: string) {
		this.log(`${socketId} added marker at ${pos}`);
		this.tokens.push({
			id: nanoid(),
			pos,
			imgUrl,
			ownerId: socketId,
			size: DEFAULT_TOKEN_SIZE,
		});
		this.updateTokens();
	}

	updateTokenPosition(
		socketId: string,
		tokenId: string,
		pos: [number, number],
	) {
		this.log(`${socketId} updated token ${tokenId} position to ${pos}`);
		const token = this.tokens.find((e) => e.id === tokenId);
		if (!token) return;
		token.pos = pos;

		this.updateTokens();
	}

	removeToken(socketId: string, tokenId: string) {
		this.log(`${socketId} removed token ${tokenId}`);
		this.updateTokens(this.tokens.filter((e) => e.id !== tokenId));
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift();
	}

	updateMarkers(markers?: Marker[]) {
		if (markers) this.markers = markers;
		this.io.to(this.roomId).emit("markers_updated", this.markers);
	}

	updateTokens(tokens?: Token[]) {
		if (tokens) this.tokens = tokens;
		this.io.to(this.roomId).emit("tokens_updated", this.tokens);
	}

	flytTo(pos: [number, number]) {
		this.io.to(this.roomId).emit("fly_to", pos);
	}

	setMap(id: string, mapUrl: string) {
		this.mapUrl = mapUrl;
		this.io.to(this.roomId).emit("set_map", mapUrl);
	}

	log(msg: string) {
		console.log(`[${this.roomId}] ${msg}`);
	}
}
