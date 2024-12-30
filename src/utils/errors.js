const ERROR_TYPES = {
  NOT_FOUND: {
    statusCode: 404,
    code: "NOT_FOUND",
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    code: "INTERNAL_ERROR",
  },
  VALIDATION_ERROR: {
    statusCode: 400,
    code: "VALIDATION_ERROR",
  },
  PRODUCT_UNAVAILABLE: {
    statusCode: 400,
    code: "PRODUCT_UNAVAILABLE",
  },
};

const createError = (type, message) => {
  const errorInfo = ERROR_TYPES[type];
  if (!errorInfo) {
    logger.error(`Tipo de error no definido: ${type}`);
    const error = new Error(message || "Error interno del servidor");
    error.statusCode = 500;
    error.code = "INTERNAL_ERROR";
    return error;
  }

  const error = new Error(message);
  error.statusCode = errorInfo.statusCode;
  error.code = errorInfo.code;
  return error;
};

module.exports = {
  ERROR_TYPES,
  createError,
};
