import {Argv} from 'yargs';
import {createLambdaIntegration} from '../cdk/create-lambda-integration';
import {createS3Integration} from '../cdk/create-s3-integration';
import {createStack} from '../cdk/create-stack';
import {defaults} from '../defaults';
import {DeploymentDescriptor} from '../utils/deployment-descriptor';
import {loadAppConfig} from '../utils/load-app-config';

export interface CreateArgv {
  readonly _: ['create'];
  readonly config: string;
  readonly stackName?: string;
}

export function create(argv: CreateArgv): void {
  const appConfig = loadAppConfig(argv.config, argv.stackName);
  const deploymentDescriptor = new DeploymentDescriptor(appConfig);
  const deployment = createStack(deploymentDescriptor);
  const {lambdaConfigs = [], s3Configs = [], customHook} = appConfig;

  for (const lambdaConfig of lambdaConfigs) {
    createLambdaIntegration(deploymentDescriptor, deployment, lambdaConfig);
  }

  for (const s3Config of s3Configs) {
    createS3Integration(deployment, s3Config);
  }

  if (customHook) {
    customHook(deployment);
  }
}

create.describe = (yargs: Argv) =>
  yargs.command('create [options]', 'Create a stack using the CDK', args =>
    args
      .describe('config', 'The path to the config file')
      .string('config')
      .default('config', defaults.configFilename)

      .describe(
        'stack-name',
        'Optional overwriting of the stack name declared in the config file'
      )
      .string('stack-name')

      .example("cdk deploy --app '$0 create' --profile clebert", '')

      .example(
        "cdk deploy --app '$0 create --stack-name stage' --profile clebert",
        ''
      )
  );

create.matches = (argv: {_: string[]}): argv is CreateArgv =>
  argv._[0] === 'create';
