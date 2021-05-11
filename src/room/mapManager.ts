import { MapData } from "./interfaces";
import { Server as IO } from "socket.io";
import e from "express";
import { nanoid } from "nanoid";
export default class MapManager {
	maps: MapData[];
	current: number;

	constructor(private io: IO, private roomId: string, maps: MapData[] = []) {
		this.maps = maps;
		this.current = 0;
	}

	setMaps(maps: MapData[]) {
		this.maps = maps.map((e) => ({ ...e, id: nanoid() }));
		this.io.to(this.roomId).emit("set_maps", this.maps);
	}

	setCurrentMap(current: number) {
		this.current = current;
		this.io.to(this.roomId).emit("set_current_map", this.current);
	}
}
