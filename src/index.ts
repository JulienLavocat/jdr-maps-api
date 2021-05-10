import { config } from "dotenv";
import { Server as HTTPServer } from "http";
import express from "express";
import { Server as IO, Socket } from "socket.io";
import Room from "./room";
import router from "./express";
import cors from "cors";
import { nanoid } from "nanoid";
import RoomsManager from "./room/roomsManager";
import ChannelsManager from "./chat/channelsManager";
import { Message } from "./chat/channel";
config();

const app = express();
const http = new HTTPServer(app);
const io = new IO(http, {
	allowEIO3: true,
});

app.use(
	cors({
		origin: "*",
	}),
);

app.use(router);

RoomsManager.addRoom("jdr");

const chatHandlers: Record<string, (socket: Socket, ...args: any[]) => void> = {
	initialize: (socket, channelId: string, username: string) => {
		const channel = ChannelsManager.get(channelId);

		channel.onJoin(socket, username);

		socket.emit(
			"initialize",
			channelId,
			channel.getMessages(),
			channel.users,
		);
	},
	send_message: (socket, channelId: string, msg: Message) =>
		ChannelsManager.get(channelId).send(msg),
	clear_messages: (socket, channelId: string) =>
		ChannelsManager.get(channelId).clear(),
};

io.on("connection", (socket) => {
	const roomId = socket.handshake.query.roomId;
	const userId = socket.handshake.query.userId;
	const name = socket.handshake.query.name;
	console.log(name);
	if (!roomId || Array.isArray(roomId)) return socket.disconnect();
	if (!userId || Array.isArray(userId)) return socket.disconnect();
	if (!name || Array.isArray(name)) return socket.disconnect();
	socket.data.userId = userId;
	socket.data.name = name;

	socket.leave(socket.data.userId);
	socket.join(roomId);

	RoomsManager.getRoom(roomId).onJoin(socket, name);

	for (const [event, handler] of Object.entries(chatHandlers))
		socket.on(event, (...args) => handler(socket, ...args));
});

http.listen(parseInt(process.env.PORT || "8080"), () => {
	console.log("Listening on " + process.env.PORT || "8080");
});

export { io };
