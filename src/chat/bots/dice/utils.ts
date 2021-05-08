import { MessageSender, Message } from "../../channel";
import MessageBuilder from "../../messageBuilder";
export const randomRange = (min: number, max: number) => {
	return min + Math.floor(Math.random() * (max - min + 1));
};

const SUCCESS_EMOJI = "de";
const FAIL_EMOJI = "issou";

const SUCCESS_GIFS = [
	"https://tenor.com/view/jim-carrey-ace-ventura-thumbs-up-smile-smiling-gif-5194908",
	"https://tenor.com/view/yes-baby-goal-funny-face-gif-13347383",
];

const FAIL_GIF = [
	"https://tenor.com/view/gandalf-old-man-naked-take-robe-off-funny-gif-17224126",
];

const NEAR_SUCCESS_GIF = [
	"https://tenor.com/view/so-close-nick-young-for-three-in-and-out-lol-gif-16815386",
	"https://tenor.com/view/so-close-basketball-thomas-morris-gif-18086098",
];

const NEAR_FAIL_GIF = [
	"https://tenor.com/view/sweating-nervous-paranoid-gif-4974019",
];

export const getRollDiceMessage = async (
	to: string,
	random: number,
	value: number,
	sender: MessageSender,
): Promise<Message> => {
	if (value === 100) {
		if (random <= 5) {
			const mb = new MessageBuilder(sender)
				.reply(to)
				.text(`${random} Succès critique ! `)
				.emoji(SUCCESS_EMOJI)
				.text("\n");

			return (await mb.gif(getSuccessGif())).build();
		}

		if (random <= 10 && random > 5) {
			const mb = new MessageBuilder(sender).reply(to).text(random);
			return (await mb.gif(getNearSuccessGif())).build();
		}

		if (random === 69) {
			const mb = new MessageBuilder(sender).reply(to).text(`${random}\n`);
			return (
				await mb.gif(
					"https://tenor.com/view/sausage-fest-hot-dog-gif-14785205",
				)
			).build();
		}

		if (random >= 95) {
			const mb = new MessageBuilder(sender)
				.reply(to)
				.text(`${random} Échec critique ! `)
				.emoji(FAIL_EMOJI)
				.text("\n");
			return (await mb.gif(getFailGif())).build();
		}

		if (random >= 90 && random < 95) {
			const mb = new MessageBuilder(sender)
				.reply(to)
				.text(
					`${random} C'est pas un échec critique ! C'est pas un échec critique !\n`,
				)
				.emoji(FAIL_EMOJI)
				.text("\n");
			return (await mb.gif(getNearFailGif())).build();
		}
	}

	return new MessageBuilder(sender).reply(to).text(random).build();
};

export function getSuccessGif() {
	return SUCCESS_GIFS[Math.floor(Math.random() * SUCCESS_GIFS.length)];
}

export function getFailGif() {
	return FAIL_GIF[Math.floor(Math.random() * FAIL_GIF.length)];
}

export function getNearSuccessGif() {
	return NEAR_SUCCESS_GIF[
		Math.floor(Math.random() * NEAR_SUCCESS_GIF.length)
	];
}

export function getNearFailGif() {
	return NEAR_FAIL_GIF[Math.floor(Math.random() * NEAR_FAIL_GIF.length)];
}
