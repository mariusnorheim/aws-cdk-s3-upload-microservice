#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { S3UploadServiceStackStack } from "../lib/s3-upload-service-stack";

const app = new cdk.App();

// deploy stack
new S3UploadServiceStackStack(app, "infra-cdk-s3-upload-microservice", {
    env: {
        region: process.env.CDK_DEFAULT_REGION,
        account: process.env.CDK_DEFAULT_ACCOUNT,
    },
    description: "Stack for S3 upload microservice",
    stackName: "infra-cdk-s3-upload-microservice",
});
