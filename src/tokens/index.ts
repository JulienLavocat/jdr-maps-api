import { Router } from "express";
import path from "path";
import fs from "fs";
import sharp, { RGBA, OverlayOptions } from "sharp";
const router = Router();

const statusPaths: Record<string, string> = {
	death: path.resolve(__dirname, "../../data/status/death-200x200.png"),
};

const typeColors: Record<string, RGBA> = {
	enemy: { r: 200, g: 0, b: 50, alpha: 1 },
	ally: { r: 0, g: 100, b: 200, alpha: 1 },
};

router.get("/:token/:status/:type", async (req, res) => {
	const { token, status, type } = req.params;

	if (!token || !status || !type)
		return res.status(400).send({
			message: "Bad request, missing token or status or type",
		});

	const statusImage = statusPaths[status] || null;
	const typeColor = typeColors[type] || { r: 0, g: 0, b: 0, alpha: 0 };
	const tokenPath = path.resolve(
		__dirname,
		"../../data/tokens/",
		token.replace(/\$/g, "/"),
	);

	console.log(tokenPath);

	try {
		const compositeEffects: OverlayOptions[] = [
			{
				input: tokenPath,
			},
		];

		const image = sharp({
			create: {
				width: 200,
				height: 200,
				background: typeColor,
				channels: 4,
			},
		}).png();

		if (statusImage)
			compositeEffects.push({
				input: statusImage,
			});

		const result = await image.composite(compositeEffects).toBuffer();

		res.writeHead(200, {
			"Content-Type": "image/png",
			"Content-Length": result.length,
		});
		return res.end(result);
	} catch (error) {
		console.error(error);
		res.send(error.message);
	}
});

export default router;
