import { InternalError } from '@src/util/errors/internal-error';

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error return by the StormGlass service: ${message}`);
  }
}
