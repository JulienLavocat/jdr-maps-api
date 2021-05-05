import { Server as HTTPServer } from "http";
import { Server as IO, Socket } from "socket.io";
import Room from "./room";

const http = new HTTPServer();
const io = new IO(http, {
	allowEIO3: true,
});

const rooms = {
	jdr: new Room("jdr"),
};

io.on("connection", (socket) => {
	onJoin(socket);

	socket.on(
		"add_marker",
		(roomId: string, pos: [number, number], color: string) => {
			console.log("Added marker", roomId, pos);

			const room = rooms.jdr;

			room.addMarker(pos, color);
			socket.to(room.roomId).emit("markers_updated", room.markers);
		},
	);

	socket.on("remove_marker", (roomId: string, id: string) => {
		console.log("remove", roomId, id);
		const room = rooms.jdr;

		room.removeMarker(id);
		socket.to(room.roomId).emit("markers_updated", room.markers);
	});
});

function onJoin(socket: Socket) {
	const roomId = socket.handshake.query.roomId || "";

	console.log(socket.id, "joined");
	socket.leave(socket.id);
	socket.join(roomId);

	const room = rooms.jdr;

	socket.to(roomId).emit("room_joined", {
		id: socket.id,
		color: room.getColor(),
		markers: room.markers,
	});
}

http.listen(8082);
