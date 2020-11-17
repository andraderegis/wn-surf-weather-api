import { Application } from 'express';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';

import './util/module-alias';
import { BeachesController } from '@src/controllers/beaches';
import { ForecastController } from '@src/controllers/forecast';
import * as database from '@src/database';
import { UsersController } from '@src/controllers/users';
import logger from './logger';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    await this.setupDatabase();
    this.setupExpress();
    this.setupControllers();
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private async setupDatabase(): Promise<void> {
    await database.connect();
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    const beachesController = new BeachesController();
    const forecastController = new ForecastController();
    const usersController = new UsersController();

    this.addControllers([
      beachesController,
      forecastController,
      usersController
    ]);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }
}
