import { DynamoDB, DynamoDBClient, } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"; // ES6 import


interface QueryParam {
    TableName: string,
    ExpressionAttributeNames?: {}
    ExpressionAttributeValues?: {}
    FilterExpression?: {}
    KeyConditionExpression?: string
}


export const queryAndAddToResults = async (query, results) => {
    const client = new DynamoDBClient({
        region: 'us-east-1'
    });
    const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client
    const command = new QueryCommand(query);
    let more = await ddbDocClient.send(command);
    results.push(...more.Items);
    return more.LastEvaluatedKey;
}

export const putItem = async (tableName, item) => {
    const client = new DynamoDBClient({
        region: 'us-east-1'
    });
    const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client

    var params = {
        TableName: tableName,
        Item: item
    };

    try {
        const data = await ddbDocClient.send(new PutCommand(params));
        console.log("Success - item added or updated", data);
        return data;
      } catch (err) {
        console.log("Error", err);
        return err;
      }
      
}

export const updateItem = async (tableName, item) => {
    const client = new DynamoDBClient({
        region: 'us-east-1'
    });
    const ddbDocClient = DynamoDBDocumentClient.from(client); // client is DynamoDB client


    let ue= [];
    let eav = {}
    for (let attribute of item.attributes) {
        if(ue)
        ue .push (`${attribute.key} = :${attribute.placeHolder}`)
        eav[`:${attribute.placeHolder}`] = attribute.value
    }


    try {
        const data = await ddbDocClient.send(new UpdateCommand({
               TableName : tableName,
                Key : {
                    'PK' : item.PK,
                    'SK' : item.SK
                },
                UpdateExpression: 'set '+ue.join(', '),
                ExpressionAttributeValues: eav
        }));
        console.log("Success - item added or updated", data);
        return data;
      } catch (err) {
        console.log("Error", err);
        return err;
      }
}

export const queryAndResolvePagination = async (query) => {
    try {
        let results = [];
        let LastEvaluatedKey = await queryAndAddToResults(query, results);
        while (LastEvaluatedKey) {
            LastEvaluatedKey = await queryAndAddToResults({
                ...query,
                ExclusiveStartKey: LastEvaluatedKey
            }, results)
        }
        return results;
    } catch (error) {
        return error;
    }

}

const addQueryFilters = (query, sk, filterExpressionsArray) => {
    if (sk) {
        query.ExpressionAttributeNames[`#SK`] = 'SK'
        query.ExpressionAttributeValues[`:SK`] = sk
        query.KeyConditionExpression = "#PK = :PK and begins_with(#SK,:SK)"
    }
    let expression = []
    for (let filterExpression of filterExpressionsArray) {

        query.ExpressionAttributeNames[filterExpression['ean']['key']] = filterExpression['ean']['value']
        query.ExpressionAttributeValues[filterExpression['eav']['key']] = filterExpression['eav']['value']
        expression.push(filterExpression['condition'])
    }
    if (expression.length) query.FilterExpression = expression.join(' and ')
}


export const sendQuery = async (tableName, pk, sk?, filterExpressionsArray?: [{}]) => {

    const query: QueryParam = {
        TableName: tableName,
        ExpressionAttributeNames: {
            "#PK": "PK"
        },
        ExpressionAttributeValues: {
            ":PK": pk,
        },
        KeyConditionExpression: "#PK = :PK"
    }
    addQueryFilters(query, sk, filterExpressionsArray)
    console.log(query)

    return await queryAndResolvePagination(query)

};


