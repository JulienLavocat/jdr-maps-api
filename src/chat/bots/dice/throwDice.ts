import * as utils from "./utils";
import { Message, MessageSender } from "../../channel";
import Channel from "../../channel";
import { PREFIX } from ".";
import MessageBuilder from "../../messageBuilder";

export default async function (
	channel: Channel,
	msg: Message,
	sender: MessageSender,
) {
	const args = msg.content.split(PREFIX + "d")[1].split(" ");
	const value = parseInt(args[0]);
	if (isNaN(value))
		return channel.send(
			new MessageBuilder(sender)
				.reply(msg.sender.id)
				.text(" La valeur du dé doit être un nombre entre 1 et 10 !")
				.build(),
		);

	let throws = 1;
	if (args.length >= 2) {
		const amount = parseInt(args[1]);
		throws = isNaN(amount) ? 1 : Math.max(amount, 1);
	}

	if (throws > 10)
		return channel.send(
			new MessageBuilder(sender)
				.reply(msg.sender.id)
				.text(" La valeur du dé doit être un nombre entre 1 et 10 !")
				.build(),
		);
	for (let i = 0; i < throws; i++) {
		channel.send(
			await utils.getRollDiceMessage(
				msg.sender.id,
				utils.randomRange(1, value),
				value,
				sender,
			),
		);
	}
}
