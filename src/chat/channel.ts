import { nanoid } from "nanoid";
import { Socket, Server as IO } from "socket.io";
import ChatBot from "./bots/chatBot";

export interface MessageSender {
	id: string;
	name: string;
}

export interface Message {
	id?: string;
	sender: MessageSender;
	content: string;
	sentAt: number;
}

export default class Channel {
	bot: ChatBot | null;
	messages: Message[];
	users: Record<string, MessageSender>;

	constructor(
		private io: IO,
		public id: string,
		public name: string,
		bot: ChatBot | null = null,
	) {
		this.messages = [];
		this.bot = bot;
		this.users = {};
	}

	attachBot(bot: ChatBot) {
		this.bot = bot;
	}

	onJoin(socket: Socket, username: string) {
		socket.join(this.id);

		this.users[socket.data.userId] = {
			id: socket.data.userId,
			name: username || "Unknown Player",
		};
		console.log("emit new user");
		socket.to(this.id).emit("new_user", this.id, this.users);
	}

	onLeave(socketId: string) {
		delete this.users[socketId];
	}

	send(msg: Message) {
		if (!msg.id) msg.id = nanoid();
		msg.sentAt = Date.now();
		this.messages.push(msg);
		this.io.to(this.id).emit("new_message", this.id, 1, this.messages);
		this.bot?.onMessage(this, msg);
	}

	getMessages() {
		return this.messages;
	}

	clear() {
		this.messages = [];
		this.io.to(this.id).emit("clear_messages", this.id);
	}
}
