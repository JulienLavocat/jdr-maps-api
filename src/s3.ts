import aws from "aws-sdk";
import { config } from "dotenv";
config();

const s3 = new aws.S3({
	hostPrefixEnabled: false,
	endpoint: process.env.S3_ENDPOINT,
	region: "fr-par",
});

console.log(s3);

export const listMaps = async () => {
	return (
		await s3
			.listObjects({
				Bucket: "jdr",
			})
			.promise()
	).Contents?.map((e) => ({
		name: e.Key,
		date: e.LastModified,
		url: "https://jdr.s3.fr-par.scw.cloud" + "/" + e.Key,
	}));
};

export default s3;
