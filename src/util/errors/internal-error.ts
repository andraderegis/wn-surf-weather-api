export class InternalError extends Error {
  constructor(
    public message: string,
    protected code: number = 500,
    protected decription?: string
  ) {
    super(message);

    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
