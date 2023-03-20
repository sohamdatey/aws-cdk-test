import { S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import
import { v4 } from 'uuid'

export async function handler(event, context) {
    console.log('uuid', v4())
    console.log('event: ', JSON.stringify(event))
    console.log(event.Records[0]?.s3.bucket.name, event.Records[0]?.s3.object.key)
    await run(event.Records[0]?.s3.bucket.name, event.Records[0]?.s3.object.key);
    return {
        statusCode: 200
    }
}


export const run = async (bucketName: string, fileName) => {
    try {
        const REGION = "us-east-1";
        const s3Client = new S3Client({ region: REGION });

        const bucketParams = {
            Bucket: bucketName,
            Key: fileName,
        };
        // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
        const data = await s3Client.send(new GetObjectCommand(bucketParams));
        // Convert the ReadableStream to a string.
        const filedata: Uint8Array = await data.Body.transformToByteArray();

        let stringdata: string;
        filedata.forEach(element => {
            stringdata += String.fromCharCode(element);
        });
        console.log(Buffer.from(filedata).toString('base64'))
        // console.log(filedata)
    } catch (err) {
        console.log("Error", err);
    }
};



export const getDeleteRequestsFromDB = async (contractId, empId?) => {

    let tableName= "Test";
    const queryParams = empId? {
        TableName: tableName,
        ExpressionAttributeNames: {
            "#PK": "PK",
            "#SK": "SK"
        },
        ExpressionAttributeValues: {
            ":CONTRACT": `contractId#${contractId}`,
            ":EMP": `empId#${empId}`,
        },
        //FilterExpression: "#PK = :CONTRACT",
        KeyConditionExpression: "#PK = :CONTRACT and begins_with(#SK,:EMP)"
    } : {
        TableName: tableName,
        ExpressionAttributeNames: {
            "#PK": "PK"
        },
        ExpressionAttributeValues: {
            ":CONTRACT": `contractId#${contractId}`,
        },
        //FilterExpression: "#PK = :CONTRACT",
        KeyConditionExpression: "#PK = :CONTRACT"
    }
    try {
        let results = [];
        let LastEvaluatedKey = await queryAndAddToResults(queryParams, results);
        while (LastEvaluatedKey) {
            LastEvaluatedKey = await queryAndAddToResults({
                ...queryParams,
                ExclusiveStartKey: LastEvaluatedKey
            }, results)
        }
       return results;
    }catch(error){
        //console.log('Unable to retrieve, requests with given, contractId', error)
        return error;
    }
   

};
const queryAndAddToResults = async (query, results) => {
    const client = new DynamoDBClient({
        region: 'us-east-1'
    });
    const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client
    const command = new QueryCommand(query);
    let more = await ddbDocClient.send(command);
    results.push(...more.Items);
    return more.LastEvaluatedKey;
}
try {
    getDeleteRequestsFromDB('123456').then(
        (data)=>{ console.log(data)},
      // (error) =>{console.log('some error')}
     );
}catch (error){
    console.log('some error')
}
