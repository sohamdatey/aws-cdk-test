import { S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand } from "@aws-sdk/client-s3";

import { v4 } from 'uuid'
import { putItem, sendQuery, updateItem } from './dynamo-utils';


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







try {
    sendQuery('Test', 'contractId#123456', 'empId#12345', [
        {
            ean: {
                key: '#asd',
                value: 'asd'
            },
            eav: {
                key: ':asd',
                value: 'soham'
            },
            'condition': 'begins_with(#asd, :asd)'
        }
    ]).then(
        (data) => { console.log(data) },
        // (error) =>{console.log('some error')}
    );

    putItem('Test', {
        'PK' : 'contractId#123456',
        'SK' : 'empId#8469#abfp-roin',
        'asd' : 'soham'
    });
    updateItem('Test', {
        PK : 'contractId#123456',
        SK : 'empId#8468#abfp-roin',
        attributes : [
            {
                key : 'Test2',
                placeHolder : 'T',
                value :'Hurray2!'
            },
            {
                key : 'Test1',
                placeHolder : 'P',
                value :'HurrayUpdated'
            }
        ]
    });

    
} catch (error) {
    console.log('some error')
}
