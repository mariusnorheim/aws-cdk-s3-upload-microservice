import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";

export interface SimpleQueueProps {
    name: string;
    visibilityTimeout: number;
    retentionPeriod: number;
}

export class SimpleQueue extends Construct {
    public readonly queue: sqs.Queue;
    constructor(scope: Construct, id: string, props: SimpleQueueProps) {
        super(scope, id);

        // create a sqs queue
        this.queue = new sqs.Queue(this, `${props.name}-sqs-queue`, {
            visibilityTimeout: cdk.Duration.seconds(props.visibilityTimeout),
            retentionPeriod: cdk.Duration.days(props.retentionPeriod),
        });
    }
}
