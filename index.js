import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
const REGION = "us-east-1";
const s3Client = new S3Client({ region: REGION });

export const bucketParams = {
  Bucket: "javaexpedite",
  Key: "testexcel.xlsx",
};

export const run = async () => {
  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(new GetObjectCommand(bucketParams));
    // Convert the ReadableStream to a string.
    const filedata = await data.Body.transformToByteArray();

    const stringdata = filedata.reduce((data,byte)=>{
        return data + String.fromCharCode(byte);
    });
    console.log(Buffer.from(filedata).toString('base64'))
   // console.log(filedata)
  } catch (err) {
    console.log("Error", err);
  }
};

run();