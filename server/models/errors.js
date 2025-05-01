const statusCodes = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

class CustomError extends Error {
  constructor(message, status = statusCodes.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

module.exports = {
  CustomError,
  statusCodes
};