import logger from '@src/logger';
import { CUSTOM_VALIDATION } from '@src/models/user';
import ApiError, { APIError } from '@src/util/errors/api-error';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ResponseError } from './interfaces/response-error';

export abstract class BaseController {
  protected sendCreateOrUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handlerClientErrors(error);

      res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error
        })
      );
      return;
    }

    logger.error(error);

    res
      .status(500)
      .send(ApiError.format({ code: 500, message: 'Something went wrong!' }));
  }

  private handlerClientErrors(
    error: mongoose.Error.ValidationError
  ): ResponseError {
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (error) => error.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    return duplicatedKindErrors.length
      ? { code: 409, error: error.message }
      : { code: 422, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
