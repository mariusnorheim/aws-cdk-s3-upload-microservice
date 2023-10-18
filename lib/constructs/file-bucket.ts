import { RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

export interface FileBucketProps {
    name: string;
}

export class FileBucket extends Construct {
    public readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: FileBucketProps) {
        super(scope, id);

        // create a bucket
        this.bucket = new s3.Bucket(this, `file-bucket-${props.name}`, {
            bucketName: props.name,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }
}
