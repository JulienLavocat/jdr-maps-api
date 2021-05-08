import { json } from "express";
import fetch from "node-fetch";

const cache: Record<string, string> = {};

export const getMedia = async (gifUrl: string) => {
	if (cache[gifUrl]) return cache[gifUrl];

	const split = gifUrl.split("-");
	const res = await (
		await fetch(
			`https://g.tenor.com/v1/gifs?ids=${split[split.length - 1]}&key=${
				process.env.TENOR_API_KEY
			}&media_filter=minimal`,
		)
	).json();

	try {
		const gif = res.results[0].media[0].gif.url;
		cache[gifUrl] = gif;
		return gif;
	} catch (error) {
		console.error(error);
		console.log(res);
	}
};
