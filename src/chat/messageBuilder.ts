import { nanoid } from "nanoid";
import { getMedia } from "../utils/tenor";
import { MessageSender, Message } from "./channel";

const SPLITTER = "$_$";

export default class MessageBuilder {
	content: string;

	constructor(private sender: MessageSender) {
		this.content = "";
	}

	reply(to: string) {
		this.mention(to).text(", ");
		return this;
	}

	text(text: string | number) {
		this.content += text;
		return this;
	}

	mention(userId: string) {
		this.content += `<@${SPLITTER}${userId}>`;
		return this;
	}

	async gif(url: string) {
		const gif = await getMedia(url);

		this.content += `<gif${SPLITTER}${gif}>`;
		return this;
	}

	emoji(emoji: string) {
		this.content += `<emoji${SPLITTER}${emoji}>`;
		return this;
	}

	build(): Message {
		return {
			sentAt: Date.now(),
			sender: this.sender,
			content: this.content,
			id: nanoid(),
		};
	}
}
