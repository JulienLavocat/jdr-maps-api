import { Router, Request } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import s3, { listMaps } from "./s3";

const router = Router();

const upload = multer({
	storage: multerS3({
		s3,
		bucket: "jdr",
		metadata: (req, file, cb) => {
			console.log((req as Request).body);
			cb(null, Object.assign({}, (req as Request).body));
		},
		key: (req, file, cb) => {
			cb(null, (req as Request).body.name);
		},
		acl: "public-read",
	}),
});

router.post("/maps", upload.single("file"), async (req, res) => {
	res.send({
		uploaded: true,
		message: "Successfully uploaded",
		maps: await listMaps(),
	});
});

router.get("/maps", async (req, res) => {
	res.send(await listMaps());
});

router.get("/maps/:id", (req, res) => {
	res.send(
		s3.getObject({
			Bucket: "jdr",
			Key: req.params.id,
		}),
	);
});

export default router;
