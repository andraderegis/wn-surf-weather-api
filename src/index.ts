import config from 'config';
import logger from './logger';
import { SetupServer } from './server';

enum ExitStatus {
  Failure = 1,
  Success = 0
}

process.on('uncaughtException', (reason: any, promise: any) => {
  logger.error(
    `App exiting due to an unhandled promise: ${promise} and reason: ${reason}`
  );

  throw reason;
});

process.on('uncaughtException', (error) => {
  logger.error(`App exiting due to an uncaught exception: ${error}`);

  process.exit(ExitStatus.Failure);
});

(async (): Promise<void> => {
  try {
    const server = new SetupServer(config.get('App.port'));
    await server.init();
    server.start();

    const existSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    existSignals.map((sign) => {
      process.on(sign, async () => {
        try {
          await server.close();

          logger.info(`App exited with success`);

          process.exit(ExitStatus.Success);
        } catch (e) {
          logger.error(`App existed with error: ${e}`);

          process.exit(ExitStatus.Failure);
        }
      });
    });
  } catch (e) {
    logger.error(`App exited with error: ${e}`);

    process.exit(ExitStatus.Failure);
  }
})();
