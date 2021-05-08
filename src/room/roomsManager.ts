import { io } from "..";
import Room from "./index";
export default class RoomsManager {
	static rooms: Record<string, Room> = {};

	static addRoom(name: string) {
		this.rooms[name] = new Room(io, name);
	}

	static getRoom(name: string) {
		return this.rooms[name];
	}
}
