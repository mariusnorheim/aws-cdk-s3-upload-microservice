import * as fs from 'fs';
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

export class Parameters {
  private _application: string;
  private _environment: string;
  private _description: string;
  private _bucketname: string;
  private _lambdatimeout: number;
  private _lambdamemorysize: number;
  private _lambdaenvslackbottoken: string;
  private _lambdaenvslackchannelid: string;
  private _evenruleminutes: string;
  

  constructor() {
    var params = JSON.parse(fs.readFileSync('./params.json', 'utf8')).Parameters;
    this._application = params.Application;
    this._environment = params.Environment;
    this._description = params.Description;
    this._bucketname = params.BucketName;
    this._lambdatimeout = params.LambdaTimeout;
    this._lambdamemorysize = params.LambdaMemorySize;
    this._lambdaenvslackbottoken = params.LambdaEnvSlackBotToken;
    this._lambdaenvslackchannelid = params.LambdaEnvSlackChannelId;
    this._evenruleminutes = params.EventRuleMinutes;
  }

  get application(): string { return this._application; }
  get environment(): string { return this._environment; }
  get description(): string { return this._description; }
  get bucketname(): string { return this._bucketname; }
  get lambdatimeout(): number { return this._lambdatimeout; }
  get lambdamemorysize(): number { return this._lambdamemorysize; }
  get lambdaenvslackbottoken(): string { return this._lambdaenvslackbottoken; }
  get lambdaenvslackchannelid(): string { return this._lambdaenvslackchannelid; }
  get eventruleminutes(): string { return this._evenruleminutes; }
}
