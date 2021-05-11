import { nanoid } from "nanoid";
import { Server as IO, Socket } from "socket.io";
import DiceBot from "../chat/bots/dice/index";
import ChannelsManager from "../chat/channelsManager";
import { EntityManager } from "./entityManager";
import { MapData, Marker, Token, UserInfos } from "./interfaces";
import MapManager from "./mapManager";
import RoomsManager from "./roomsManager";

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
			rotation: 0,
		});
	},
	update_token: (
		socket: Socket,
		roomId: string,
		tokenId: string,
		pos: [number, number],
		rotation: number,
	) => {
		const tokens = RoomsManager.getRoom(roomId).tokens;
		tokens.set(tokenId, {
			...tokens.get(tokenId),
			pos,
			rotation,
		});
	},
	set_current_map: (socket: Socket, roomId: string, map: number) => {
		RoomsManager.getRoom(roomId).setCurrentMap(socket.data.userId, map);
	},
	set_maps: (socket: Socket, roomId: string, maps: MapData[]) => {
		RoomsManager.getRoom(roomId).setMaps(socket.data.userId, maps);
	},
	remove_token: (socket: Socket, roomId: string, tokenId: string) => {
		RoomsManager.getRoom(roomId).tokens.remove(tokenId);
	},
	fly_to: (socket, roomId: string, pos: [number, number], zoom: number) => {
		RoomsManager.getRoom(roomId).flytTo(pos, zoom);
	},
	disconnecting: (socket: Socket, reason) => {
		for (const roomId of socket.rooms)
			RoomsManager.getRoom(roomId)?.onLeave(socket.data.userId);
	},
};

export default class Room {
	private colors: string[];
	markers: EntityManager<Marker>;
	tokens: EntityManager<Token>;
	chats: { name: string; id: string }[];
	users: Record<string, UserInfos>;
	mapManager: MapManager;

	constructor(private io: IO, private roomId: string) {
		this.colors = [...COLORS];
		this.markers = new EntityManager(io, roomId, "markers");
		this.tokens = new EntityManager(io, roomId, "tokens");
		this.mapManager = new MapManager(io, roomId, [
			{
				name: "Garde.jpg",
				url: "Garde.jpg",
				date: Date.now(),
				id: nanoid(),
			},
		]);

		const channel = ChannelsManager.createChannel(
			"lancer-de-dés",
			new DiceBot(),
		);

		this.chats = [{ id: channel.id, name: channel.name }];
		this.users = {};
	}

	onJoin(socket: Socket, name: string) {
		this.log(`${socket.data.userId} connected`);

		const color = this.getColor();

		this.users[socket.data.userId] = {
			id: socket.data.userId,
			color,
			name,
		};

		this.io.to(this.roomId).emit("room_joined", {
			id: socket.data.userId,
			color,
			markers: this.markers.getEntities(),
			tokens: this.tokens.getEntities(),
			map: {
				maps: this.mapManager.maps,
				current: this.mapManager.current,
			},
			chats: this.chats,
			users: this.users,
		});

		for (const [event, handler] of Object.entries(roomHandlers))
			socket.on(event, (...args) => handler(socket, ...args));
	}

	onLeave(userId: string) {
		console.log("Removing marker of " + userId);
		//this.updateMarkers(this.markers.filter((e) => e.ownerId !== socketId));
		delete this.users[userId];
		for (const channel of this.chats)
			ChannelsManager.get(channel.id).onLeave(userId);
	}

	getColor() {
		if (this.colors.length === 0) this.colors = [...COLORS];
		return this.colors.shift() || "";
	}

	flytTo(pos: [number, number], zoom: number) {
		this.io.to(this.roomId).emit("fly_to", pos, zoom);
	}

	setCurrentMap(id: string, map: number) {
		this.mapManager.setCurrentMap(map);
	}

	setMaps(id: string, maps: MapData[]) {
		this.mapManager.setMaps(maps);
	}

	log(msg: string) {
		console.log(`[${this.roomId}] ${msg}`);
	}
}
