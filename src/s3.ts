import aws from "aws-sdk";
import { config } from "dotenv";
config();

const s3 = new aws.S3({
	hostPrefixEnabled: false,
	endpoint: process.env.S3_ENDPOINT,
	region: "fr-par",
});

export const listMaps = async () => {
	return (
		await s3
			.listObjects({
				Bucket: "jdr",
			})
			.promise()
	).Contents?.map((e) => ({ name: e.Key, date: e.LastModified }));
};

export default s3;
