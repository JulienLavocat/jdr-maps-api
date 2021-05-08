import { Message } from "../../channel";
import ChatBot from "../chatBot";
import Channel from "../../channel";
import { nanoid } from "nanoid";
import throwDice from "./throwDice";

export const PREFIX = "!";

export default class DiceBot extends ChatBot {
	constructor() {
		super({
			id: nanoid(),
			name: "DiceBot",
		});
	}

	async onMessage(channel: Channel, msg: Message): Promise<void> {
		if (msg.sender.id === this.sender.id || !msg.content.startsWith(PREFIX))
			return;

		const cmd = msg.content.slice(PREFIX.length);

		if (cmd.startsWith("d")) {
			await throwDice(channel, msg, this.sender);
			return;
		}

		return;
	}
}
