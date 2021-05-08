import Channel from "./channel";
import { io } from "..";
import { nanoid } from "nanoid";
import ChatBot from "./bots/chatBot";

export default class ChannelsManager {
	static channels: Record<string, Channel> = {};

	static createChannel(name: string, bots: ChatBot | null = null) {
		const channel = new Channel(io, nanoid(), name, bots);
		this.channels[channel.id] = channel;
		return channel;
	}

	static get(id: string) {
		return this.channels[id];
	}
}
