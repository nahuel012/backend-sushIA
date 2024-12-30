require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { errorHandler, logger } = require("./src/middleware/errorHandler");
const connectDB = require("./config.js/database");
const eventService = require("./src/services/event.service");
const SocketService = require("./src/services/socket.service");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const routes = require("./src/routes");

const app = express();
const httpServer = createServer(app);

// Solo loguear si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  logger.info("Iniciando servidor");
}

// middlewares
app.use(cors());
app.use(express.json());

// Solo usar el middleware de logging si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    logger.info("Solicitud entrante", {
      path: req.path,
      method: req.method,
      query: req.query,
      ip: req.ip,
    });

    res.on("finish", () => {
      logger.info("Respuesta enviada", {
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
      });
    });

    next();
  });
}

// swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sushi Chatbot API",
      version: "1.0.0",
      description: "API para el chatbot de sushi",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Servidor local",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

if (process.env.NODE_ENV === "development") {
  const swaggerSpec = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// mongodb connection - solo conectar si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      logger.info("Conexión a la base de datos establecida");
    })
    .catch((err) => {
      logger.error("Error al conectar a la base de datos", err);
    });
}

//Routes
app.use("/api/v1", routes);

// Socket service - solo inicializar si no estamos en modo test
let socketService;
if (process.env.NODE_ENV !== "test") {
  socketService = new SocketService(httpServer);
  eventService.setSocketService(socketService);
}

//404 error
app.use("*", (req, res) => {
  if (process.env.NODE_ENV !== "test") {
    logger.warn("Ruta no encontrada: ", { path: req.originalUrl });
  }
  res.status(404).json({
    success: false,
    message: "No se encontró la ruta solicitada",
  });
});

app.use(errorHandler);

// Eventos solo si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  process.on("unhandledRejection", (err) => {
    logger.error("Error no gestionado", {
      error: err.message,
      stack: err.stack,
    });

    httpServer.close(() => {
      httpServer.close(() => {
        process.exit(1);
      });
    });
  });

  process.on("uncaughtException", (err) => {
    logger.error("Error no capturado", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
}

const PORT = process.env.PORT || 3000;

// solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  httpServer.listen(PORT, () => {
    logger.info(`Server corriendo en el puerto ${PORT}`);
    if (process.env.NODE_ENV === "development") {
      logger.info(
        `Documentación disponible en http://localhost:${PORT}/api-docs`
      );
    }
  });
}

module.exports = { app, httpServer, socketService };
