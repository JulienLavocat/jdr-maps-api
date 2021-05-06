import { config } from "dotenv";
import { Server as HTTPServer } from "http";
import express from "express";
import { Server as IO, Socket } from "socket.io";
import Room from "./room";
import router from "./express";
import cors from "cors";
config();

const app = express();
const http = new HTTPServer(app);
const io = new IO(http, {
	allowEIO3: true,
});

const rooms: Record<string, Room> = {
	jdr: new Room("jdr", io),
};

app.use(
	cors({
		origin: "*",
	}),
);

app.use(router);

io.on("connection", (socket) => {
	onJoin(socket);

	socket.on(
		"add_marker",
		(roomId: string, pos: [number, number], color: string) => {
			rooms[roomId].addMarker(socket.id, pos, color);
		},
	);

	socket.on("remove_marker", (roomId: string, id: string) => {
		rooms[roomId].removeMarker(socket.id, id);
	});

	socket.on(
		"add_token",
		(roomId: string, pos: [number, number], imgUrl: string) => {
			rooms[roomId].addToken(socket.id, pos, imgUrl);
		},
	);

	socket.on(
		"update_token_pos",
		(roomId: string, tokenId: string, pos: [number, number]) => {
			rooms[roomId].updateTokenPosition(socket.id, tokenId, pos);
		},
	);

	socket.on("set_map", (roomId: string, mapUrl: string) => {
		rooms[roomId].setMap(socket.id, mapUrl);
	});

	socket.on("remove_token", (roomId: string, tokenId: string) => {
		rooms[roomId].removeToken(socket.id, tokenId);
	});

	socket.on("disconnecting", (reason) => {
		console.log(socket.rooms);
		for (const roomId of socket.rooms) rooms[roomId]?.onLeave(socket.id);
	});
});

function onJoin(socket: Socket) {
	const roomId = socket.handshake.query.roomId || "";

	if (!roomId) socket.disconnect(true);

	socket.leave(socket.id);
	socket.join(roomId);

	rooms.jdr.onJoin(socket);
}

http.listen(parseInt(process.env.PORT || "8080"));
