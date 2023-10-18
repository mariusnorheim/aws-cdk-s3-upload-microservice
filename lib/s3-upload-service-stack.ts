import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Parameters } from "./utils/params";
import { FileBucket } from "./constructs/file-bucket";
import { SimpleQueue } from "./constructs/simple-queue";
import { LambdaFunction } from "./constructs/lambda-function";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export interface S3UploadServiceStackProps extends cdk.StackProps {}

export class S3UploadServiceStackStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: S3UploadServiceStackProps) {
        super(scope, id, props);

        // tag parameters
        const params = new Parameters();
        const application = params.application;
        const description = params.description;
        const environment = params.environment;

        // tag the stack with standard tags
        cdk.Tags.of(this).add("Application", application);
        cdk.Tags.of(this).add("Description", description);
        cdk.Tags.of(this).add("Environment", environment);

        // service parameters
        const lambdaTimeout = params.lambdatimeout;
        const lambdaMemorySize = params.lambdamemorysize;
        const lambdaEnvSlackBotToken = params.lambdaenvslackbottoken;
        const lambdaEnvSlackChannelId = params.lambdaenvslackchannelid;
        const s3BucketName = params.bucketname;

        // create an s3 bucket to store files
        const bucket = new FileBucket(this, "s3-upload-bucket", {
            name: s3BucketName,
        });

        // create a sqs queue for processing
        const queue = new SimpleQueue(this, "slack-queue", {
            name: "slack-notification-queue",
            visibilityTimeout: 30,
            retentionPeriod: 10,
        });

        // s3 upload function
        const uploadFn = new LambdaFunction(this, "s3-upload-lambda", {
            name: "s3-upload-microservice",
            description: "Lambda for uploading files to S3",
            memorySize: lambdaMemorySize,
            runtime: lambda.Runtime.PROVIDED_AL2,
            handler: "", // not required for custom runtime, but its a mandatory field
            codepath: "lambdas/s3-upload",
            timeout: lambdaTimeout,
            environment: {
                S3_BUCKET: bucket.bucket.bucketArn,
                SQS_QUEUE: queue.queue.queueName,
            },
        });
        // grant lambda access to sqs sendmessages
        queue.queue.grantSendMessages(uploadFn.role);
        // grant lambda full access to s3 bucket
        uploadFn.role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        );

        // slack notifier lambda function - send alert to slack channel if uploading of file fails
        const notificationFn = new LambdaFunction(this, "s3-upload-notification-lambda", {
            name: "s3-upload-notification",
            description: "Lambda for alert notification at slack if uploads fail",
            memorySize: 128,
            runtime: lambda.Runtime.PROVIDED_AL2,
            handler: "", // not required for custom runtime, but its a mandatory field
            codepath: "lambdas/slack-notification",
            timeout: 3,
            environment: {
                SLACK_BOT_TOKEN: lambdaEnvSlackBotToken,
                SLACK_CHANNEL_ID: lambdaEnvSlackChannelId,
            },
        });
        // add the sqs queue as event source for the processor lambda
        notificationFn.lambdaFunction.addEventSource(new SqsEventSource(queue.queue));
        // grant lambda access to sqs consumemessages
        queue.queue.grantConsumeMessages(notificationFn.lambdaFunction);
    }
}
