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

		this.users[socket.id] = {
			id: socket.id,
			name: username || "Unknown Player",
		};
	}

	onLeave(socketId: string) {
		delete this.users[socketId];
	}

	send(msg: Message) {
		if (!msg.id) msg.id = nanoid();
		this.messages.push(msg);
		this.io.to(this.id).emit("new_message", this.id, this.messages);
		this.bot?.onMessage(this, msg);
	}

	getMessages() {
		return this.messages;
	}
}
