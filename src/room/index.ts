import { nanoid } from "nanoid";
import { Socket, Server as IO } from "socket.io";
import Channel from "../chat/channel";
import { EntityManager } from "./entityManager";
import RoomsManager from "./roomsManager";
import ChannelsManager from "../chat/channelsManager";
import DiceBot from "../chat/bots/dice/index";

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

const roomHandlers: Record<string, (socket: Socket, ...args: any[]) => void> = {
	add_marker: (
		socket: Socket,
		roomId: string,
		pos: [number, number],
		color: string,
	) => {
		RoomsManager.getRoom(roomId).markers.add({
			id: nanoid(),
			color,
			pos,
			ownerId: socket.data.userId,
		});
	},
	remove_marker: (socket: Socket, roomId: string, id: string) => {
		RoomsManager.getRoom(roomId).markers.remove(id);
	},
	add_token: (
		socket: Socket,
		roomId: string,
		pos: [number, number],
		imgUrl: string,
	) => {
		RoomsManager.getRoom(roomId).tokens.add({
			id: nanoid(),
			pos,
			imgUrl,
			ownerId: socket.data.userId,
			size: DEFAULT_TOKEN_SIZE,
		});
	},
	update_token_pos: (
		socket: Socket,
		roomId: string,
		tokenId: string,
		pos: [number, number],
	) => {
		const tokens = RoomsManager.getRoom(roomId).tokens;
		tokens.update(tokenId, "pos", pos);
	},
	set_map: (socket: Socket, roomId: string, mapUrl: string) => {
		RoomsManager.getRoom(roomId).setMap(socket.data.userId, mapUrl);
	},
	remove_token: (socket: Socket, roomId: string, tokenId: string) => {
		RoomsManager.getRoom(roomId).tokens.remove(tokenId);
	},
	fly_to: (socket, roomId: string, pos: [number, number], zoom: number) => {
		RoomsManager.getRoom(roomId).flytTo(pos, zoom);
	},
	disconnecting: (socket: Socket, reason) => {
		console.log(socket.rooms);
		for (const roomId of socket.rooms)
			RoomsManager.getRoom(roomId)?.onLeave(socket.data.userId);
	},
};

export default class Room {
	private colors: string[];
	private mapUrl: string;
	markers: EntityManager<Marker>;
	tokens: EntityManager<Token>;
	chats: { name: string; id: string }[];

	constructor(private io: IO, private roomId: string) {
		this.colors = [...COLORS];
		this.markers = new EntityManager(io, roomId, "markers");
		this.tokens = new EntityManager(io, roomId, "tokens");
		this.mapUrl = "Garde.jpg";

		const channel = ChannelsManager.createChannel(
			"lancer-de-dés",
			new DiceBot(),
		);

		this.chats = [{ id: channel.id, name: channel.name }];
	}

	onJoin(socket: Socket) {
		this.log(`${socket.data.userId} connected`);

		this.io.to(this.roomId).emit("room_joined", {
			id: socket.data.userId,
			color: this.getColor(),
			markers: this.markers.getEntities(),
			tokens: this.tokens.getEntities(),
			mapUrl: this.mapUrl,
			chats: this.chats,
		});

		for (const [event, handler] of Object.entries(roomHandlers))
			socket.on(event, (...args) => handler(socket, ...args));
	}

	onLeave(socketId: string) {
		console.log("Removing marker of " + socketId);
		//this.updateMarkers(this.markers.filter((e) => e.ownerId !== socketId));
		for (const channel of this.chats)
			ChannelsManager.get(channel.id).onLeave(socketId);
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift();
	}

	flytTo(pos: [number, number], zoom: number) {
		this.io.to(this.roomId).emit("fly_to", pos, zoom);
	}

	setMap(id: string, mapUrl: string) {
		this.mapUrl = mapUrl;
		this.io.to(this.roomId).emit("set_map", mapUrl);
	}

	log(msg: string) {
		console.log(`[${this.roomId}] ${msg}`);
	}
}
