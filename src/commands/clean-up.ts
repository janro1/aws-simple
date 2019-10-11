import {Argv} from 'yargs';
import {Context} from '../context';
import {defaults} from '../defaults';
import {cleanUpStacks} from '../sdk/clean-up-stacks';

export interface CleanUpArgv {
  readonly _: ['clean-up'];
  readonly config: string;
  readonly maxAge: number;
  readonly preserve?: string[];
  readonly yes: boolean;
  readonly profile?: string;
}

export async function cleanUp(argv: CleanUpArgv): Promise<void> {
  const {config, profile, maxAge, preserve = [], yes} = argv;

  await cleanUpStacks(Context.load(config, {profile}), {
    maxAgeInDays: maxAge,
    tagNamesToPreserve: preserve,
    autoConfirm: yes
  });
}

cleanUp.describe = (yargs: Argv) =>
  yargs.command('clean-up [options]', 'Clean up old deployed stacks', args =>
    args
      .describe('config', 'The path to the config file')
      .string('config')
      .default('config', defaults.configFilename)

      .describe(
        'max-age',
        'The maximum age (in days) of a stack, all older stacks will be deleted'
      )
      .number('max-age')
      .default('max-age', 30)

      .describe(
        'preserve',
        'Optional tag names that prevent a stack from being deleted regardless of its age'
      )
      .array('preserve')

      .describe(
        'yes',
        'The confirmation message will automatically be answered with Yes'
      )
      .boolean('yes')
      .default('yes', false)

      .describe(
        'profile',
        'An AWS profile name as set in the shared credentials file'
      )
      .string('profile')

      .example('npx $0 clean-up', '')
      .example('npx $0 clean-up --max-age 14 --preserve release', '')
  );

cleanUp.matches = (argv: {_: string[]}): argv is CleanUpArgv =>
  argv._[0] === 'clean-up';
