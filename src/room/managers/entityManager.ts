import { Server as IO } from "socket.io";

export interface Entity {
	id: string;
	[key: string]: any;
}

const e: Entity = { id: "test", ds: true };
e["ds"] = "qsd";

export class EntityManager<T extends Entity> {
	private io: IO;
	private roomId: string;
	private entity: string;
	private entities: {
		[key: string]: {
			id: string;
			[key: string]: any;
		};
	};

	constructor(io: IO, roomId: string, entity: string) {
		this.io = io;
		this.roomId = roomId;
		this.entity = entity;
		this.entities = {};
	}

	add(entity: T) {
		this.entities[entity.id] = entity;
		this.broadcastUpdate();
	}
	get(entityId: string) {
		return this.entities[entityId] as T;
	}
	remove(entityId: string) {
		delete this.entities[entityId];
		this.broadcastUpdate();
	}
	set(entityId: string, updated: T) {
		this.entities[entityId] = updated;
		this.broadcastUpdate();
	}
	update(entityId: string, property: string, value: any) {
		this.entities[entityId][property] = value;
		this.broadcastUpdate();
	}

	broadcastUpdate() {
		this.io.to(this.roomId).emit(`${this.entity}_updated`, this.entities);
	}

	getEntities() {
		return this.entities;
	}
}
