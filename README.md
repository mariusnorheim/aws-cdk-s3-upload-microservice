# aws-cdk-s3-upload-microservice
A service that uploads a file to s3, with a slack notification function that will execute if the upload fails.
Written in Go (lambdas), Typescript (cdk) and Javascript (client)

The client will zip a folder of your choice and send the file to the microservice. Be aware of size limits towards AWS Lambdas (~6mb).
You might need to set account vars in bin/cdk.ts if they are not loaded into env vars "CDK_DEFAULT_ACCOUNT" and "CDK_DEFAULT_REGION"
Deployed with "cdk deploy '*'"

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
