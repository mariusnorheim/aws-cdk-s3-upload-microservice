# aws-cdk-s3-upload-microservice
A service that uploads a file to s3, with a slack notification function that will execute if the upload fails.
Written in Go (lambdas), Typescript (cdk) and Javascript (client)

# CDK deployment
You will need to set account vars (strings) in bin/cdk.ts if they are not loaded into env vars "CDK_DEFAULT_ACCOUNT" and "CDK_DEFAULT_REGION"

cdk deploy '\*'

# Upload client
The client is located in the "app" folder. It will zip a folder of your choice and send the file to the s3 upload microservice.
Be aware of size limits towards AWS Lambdas (~6mb).

cd app
npm i
node index.js

# Requirements
aws-cli tool for cdk deployment (https://aws.amazon.com/cli/)
CDK (@aws-cdk can be fetched globally via npm)
Node for running the client app
