export class InvalidFunctionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFunctionException';
  }
}
