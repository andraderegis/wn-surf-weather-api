import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Beach } from '@src/models/beach';
import { authMiddleware } from '@src/middleware/auth';
import logger from '@src/logger';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach({ ...req.body, user: req.decoded?.id });
      const result = await beach.save();
      res.status(201).send(result);
    } catch (e) {
      logger.error(e);

      e instanceof mongoose.Error.ValidationError
        ? res.status(422).send({ error: e.message })
        : res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}
