import * as cdk from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';



export class CodeInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const bucket = new Bucket(this, 'Bucket');
    // const fn = new lambda.Function(this, 'MyFunction', {
    //   runtime: lambda.Runtime.NODEJS_14_X,
    //   code: lambda.Code.fromAsset(path.join(__dirname,'../..','app')),
    //   handler: 'testlambda.main',
    // });
    const fnts = new NodejsFunction(this, 'MyTypeFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      entry : path.join(__dirname,'../..','app', 'typeTest.ts')
    });

    //bucket.addEventNotification(EventType.OBJECT_CREATED, new cdk.aws_s3_notifications.LambdaDestination(fn));
    bucket.addEventNotification(EventType.OBJECT_CREATED, new cdk.aws_s3_notifications.LambdaDestination(fnts));
    const policy = new PolicyStatement();
    policy.addActions('s3:GetObject');
    policy.addResources(bucket.bucketArn+'/*')
    policy.effect = Effect.ALLOW;
    fnts.addToRolePolicy(policy);
  }
}
