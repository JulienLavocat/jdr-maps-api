import { config } from "dotenv";
import { Server as HTTPServer } from "http";
import { Server as IO, Socket } from "socket.io";
import Room from "./room";
config();

const http = new HTTPServer();
const io = new IO(http, {
	allowEIO3: true,
});

const rooms: Record<string, Room> = {
	jdr: new Room("jdr", io),
};

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
