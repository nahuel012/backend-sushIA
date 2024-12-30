const { createLogger, format, transports } = require("winston");
const path = require("path");

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss",
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "sushi-chatbot" },
  transports: [
    new transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    })
  );
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (err.statusCode === 500) {
    logger.error("Error de servidor:", {
      error: err.message,
      originalError: err.originalError?.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
  });
};

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  errorHandler,
  catchAsync,
  logger,
};
