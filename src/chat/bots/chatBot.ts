import EventEmitter from "events";
import { Message, MessageSender } from "../channel";
import Channel from "../channel";
import { nanoid } from "nanoid";

export default abstract class ChatBot {
	constructor(protected sender: MessageSender) {}

	abstract onMessage(channel: Channel, msg: Message): void;
}
