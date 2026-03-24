export class XaraGeoError extends Error {
  public readonly statusCode: number;
  public readonly reason?: string;

  constructor(message: string, statusCode: number, reason?: string) {
    super(message);
    this.name = "XaraGeoError";
    this.statusCode = statusCode;
    this.reason = reason;
  }
}

export class XaraAuthError extends XaraGeoError {
  constructor(message: string) {
    super(message, 401);
    this.name = "XaraAuthError";
  }
}

export class XaraNotFoundError extends XaraGeoError {
  constructor(message: string) {
    super(message, 404);
    this.name = "XaraNotFoundError";
  }
}

export class XaraValidationError extends XaraGeoError {
  constructor(message: string, reason?: string) {
    super(message, 400, reason);
    this.name = "XaraValidationError";
  }
}

export class XaraRateLimitError extends XaraGeoError {
  constructor(message: string = "Rate limit exceeded. Try again later.") {
    super(message, 429);
    this.name = "XaraRateLimitError";
  }
}
