const { Server } = require("socket.io");
const openAIService = require("./openai.service");
const logger = require("../middleware/errorHandler").logger;

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    this.activeChats = new Map();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on("connection", async (socket) => {
      logger.info("Cliente conectado:", { socketId: socket.id });

      socket.on("subscribe_to_order", (orderNumber) => {
        logger.warn(orderNumber);
        logger.info("Cliente suscrito a orden", {
          socketId: socket.id,
          orderNumber,
        });
        socket.join(orderNumber);
      });

      socket.on("unsubscribe_from_order", (orderNumber) => {
        logger.info("Cliente desuscrito de orden", {
          socketId: socket.id,
          orderNumber,
        });
        socket.leave(`order_${orderNumber}`);
      });

      socket.on("reconnect_chat", async ({ threadId }) => {
        logger.info("Intento de reconexión", {
          socketId: socket.id,
          threadId,
        });

        if (threadId) {
          this.activeChats.set(socket.id, {
            threadId,
            lastMessage: Date.now(),
          });
          logger.info("Chat reconectado exitosamente", {
            socketId: socket.id,
            threadId,
          });
        }
      });

      socket.on("send_message", async ({ message, threadId }) => {
        let chatInfo = this.activeChats.get(socket.id);

        // Si el front manda un threadId, lo usamos
        if (threadId) {
          logger.debug("Usando threadId proporcionado", {
            threadId,
            socketId: socket.id,
          });
          chatInfo = {
            threadId,
            lastMessage: Date.now(),
          };
          this.activeChats.set(socket.id, chatInfo);
        }

        // Si no hay chat activo ni threadId, creamos uno nuevo y lo enviamos
        if (!chatInfo) {
          logger.debug("Creando nuevo thread", {
            socketId: socket.id,
          });
          const threadResult = await openAIService.createThread();
          if (!threadResult.success) {
            logger.error("Error al crear thread", {
              error: threadResult.error,
              socketId: socket.id,
            });
            socket.emit("error", { message: "Error al inicializar el chat" });
            return;
          }
          chatInfo = {
            threadId: threadResult.threadId,
            lastMessage: Date.now(),
          };
          this.activeChats.set(socket.id, chatInfo);
          socket.emit("thread_created", chatInfo.threadId);
          logger.debug("Thread creado exitosamente", {
            threadId: chatInfo.threadId,
            socketId: socket.id,
          });
        }

        socket.emit("bot_typing", true);

        try {
          const result = await openAIService.processMessage(
            chatInfo.threadId,
            message
          );

          if (result.success) {
            logger.debug("Mensaje procesado exitosamente", {
              threadId: chatInfo.threadId,
              socketId: socket.id,
            });
            socket.emit("receive_message", {
              role: "assistant",
              content: result.response,
            });
          } else {
            logger.warn("Error procesando mensaje", {
              threadId: chatInfo.threadId,
              socketId: socket.id,
              error: {
                message: result.error,
                details: result.details || "No details provided",
              },
            });
            socket.emit("error", {
              message: result.error || "Error procesando el mensaje",
            });
          }
        } catch (error) {
          logger.error("Error al procesar mensaje", {
            threadId: chatInfo.threadId,
            socketId: socket.id,
            error: {
              message: error.message,
              stack: error.stack,
              code: error.code,
              type: error.type,
              details:
                error.response?.data || error.cause || "No additional details",
            },
          });
          socket.emit("error", {
            message:
              "Error en el servidor: " + (error.message || "Error desconocido"),
          });
        } finally {
          socket.emit("bot_typing", false);
        }

        chatInfo.lastMessage = Date.now();
      });

      socket.on("disconnect", () => {
        logger.info("Cliente desconectado:", { socketId: socket.id });
        this.activeChats.delete(socket.id);
      });
    });
  }

  emitOrderUpdate(orderNumber, update) {
    logger.info("Emitiendo actualización de orden", {
      orderNumber,
      updateType: update.status,
    });

    let message = `¡Actualización de tu orden #${orderNumber}! 🔔\n\n`;

    switch (update.status) {
      case "pendiente":
        message += "Tu orden está pendiente de confirmación ⏳";
        break;
      case "aceptada":
        message += "¡Tu orden ha sido aceptada! 👍";
        break;
      case "en proceso":
        message += "¡Tu orden está siendo preparada! 🍱";
        break;
      case "en camino":
        message += "¡Tu orden está en camino! 🛵";
        break;
      case "entregada":
        message += "¡Tu orden ha sido entregada! ¡Que lo disfrutes! 🍣";
        break;
      case "cancelada":
        message +=
          "Haz cancelado tu orden😔. Esperamos volver a verte pronto 🤞";
        break;
      default:
        message += `Estado: ${update.status}`;
    }

    logger.info("Intentando emitir al room", {
      room: `order_${orderNumber}`,
      messageContent: message.trim(),
    });

    this.io.to(`order_${orderNumber}`).emit("receive_message", {
      role: "assistant",
      content: message.trim(),
    });

    logger.info("Mensaje de actualización enviado", {
      orderNumber,
      messageContent: message.trim(),
    });
  }
}

module.exports = SocketService;
