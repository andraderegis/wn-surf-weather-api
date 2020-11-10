import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Beach } from '@src/models/beach';

@Controller('beaches')
export class BeachesController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (e) {
      e instanceof mongoose.Error.ValidationError
        ? res.status(422).send({ error: e.message })
        : res.status(500).send({ error: 'Internal Server Error' });
    }
    // res.status(201).send({ id: 'id', ...req.body });
  }
}
