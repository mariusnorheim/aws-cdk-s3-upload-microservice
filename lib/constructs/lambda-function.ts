import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";

export interface LambdaFunctionProps {
    name: string;
    description?: string;
    memorySize: number;
    runtime: lambda.Runtime;
    handler: string;
    codepath: string;
    timeout: number;
    environment?: {
        [key: string]: string;
    };
}

export class LambdaFunction extends Construct {
    public readonly lambdaFunction: lambda.Function;
    public readonly role: iam.Role;

    constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
        super(scope, id);

        // create a role for the lambda
        this.role = new iam.Role(this, `${props.name}-lambda-role`, {
            roleName: `${props.name}-lambda-role`,
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            description: props.description ? props.description : "",
        });
        this.role.addManagedPolicy(
            iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        );

        // create a lambda function
        this.lambdaFunction = new lambda.Function(this, `${props.name}-function`, {
            functionName: props.name,
            description: props.description,
            memorySize: props.memorySize,
            runtime: props.runtime,
            handler: props.handler,
            code: lambda.Code.fromAsset(props.codepath),
            timeout: cdk.Duration.seconds(props.timeout),
            role: this.role,
            environment: props.environment,
        });
    }
}
