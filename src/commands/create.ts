import type {Argv} from 'yargs';
import {createStack} from '../cdk/create-stack';
import type {AppConfig} from '../types';

interface CreateArgv {
  readonly _: ['create'];
}

function isCreateArgv(argv: {readonly _: unknown[]}): argv is CreateArgv {
  return argv._[0] === `create`;
}

export function create(
  appConfig: AppConfig,
  argv: {readonly _: unknown[]},
): void {
  if (isCreateArgv(argv)) {
    createStack(appConfig);
  }
}

create.describe = (argv: Argv) =>
  argv.command(
    `create [options]`,
    `Create a stack using the CDK`,
    (commandArgv) =>
      commandArgv
        .example(`npx $0 create`, ``)
        .example(`npx cdk deploy --app 'npx $0 create'`, ``),
  );
