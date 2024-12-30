const OpenAI = require("openai");
const productController = require("../controllers/product.controller");
const orderController = require("../controllers/order.controller");
const { logger } = require("../middleware/errorHandler");

class OpenAIService {
  constructor() {
    logger.info("Inicializando OpenAI Service con API KEY:", {
      apiKey: process.env.OPENAI_API_KEY ? "Presente" : "No presente",
      assistantId: process.env.ASSISTANT_ID,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.assistantId = process.env.ASSISTANT_ID;
  }

  async createThread() {
    try {
      logger.info("Intentando crear nuevo thread...");
      const thread = await this.openai.beta.threads.create();
      logger.info("Thread creado exitosamente:", { threadId: thread.id });

      return {
        success: true,
        threadId: thread.id,
      };
    } catch (error) {
      logger.error("Error al crear thread:", {
        message: error.message,
        type: error.type,
        code: error.code,
      });
      return {
        success: false,
        error: "Error al inicializar la conversación",
      };
    }
  }

  async processMessage(threadId, userMessage) {
    logger.info(`Procesando mensaje para thread ${threadId}:`, { userMessage });
    try {
      const messageContent =
        typeof userMessage === "object" ? userMessage.message : userMessage;

      try {
        const runs = await this.openai.beta.threads.runs.list(threadId);
        const activeRun = runs.data.find((run) =>
          ["in_progress", "queued", "requires_action"].includes(run.status)
        );

        if (activeRun) {
          logger.info("Run activo encontrado:", {
            runId: activeRun.id,
            status: activeRun.status,
          });

          if (activeRun.status === "requires_action") {
            await this.handleToolCalls(
              threadId,
              activeRun.id,
              activeRun.required_action.submit_tool_outputs.tool_calls
            );
          } else {
            logger.info("Cancelando run activo:", { runId: activeRun.id });
            await this.openai.beta.threads.runs.cancel(threadId, activeRun.id);
          }
        }
      } catch (error) {
        logger.warn("Error al verificar runs activos:", { error });
      }

      await this.openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: messageContent,
      });

      logger.info("Ejecutando asistente...");
      const run = await this.openai.beta.threads.runs.create(threadId, {
        assistant_id: this.assistantId,
      });

      logger.info("Run creado:", { runId: run.id });

      let runStatus = await this.checkRunStatus(threadId, run.id);

      while (
        runStatus.status === "in_progress" ||
        runStatus.status === "queued" ||
        runStatus.status === "requires_action"
      ) {
        if (runStatus.status === "requires_action") {
          const toolCalls =
            runStatus.required_action.submit_tool_outputs.tool_calls;
          await this.handleToolCalls(threadId, run.id, toolCalls);
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.checkRunStatus(threadId, run.id);
      }

      if (runStatus.status === "completed") {
        const messages = await this.openai.beta.threads.messages.list(threadId);
        const lastMessage = messages.data[0];

        return {
          success: true,
          response: lastMessage.content[0].text.value,
        };
      } else {
        throw new Error(`Run failed with status: ${runStatus.status}`);
      }
    } catch (error) {
      logger.error("Error al procesar mensaje:", {
        error: {
          message: error.message,
          code: error.code,
          type: error.type,
          status: error.status,
          details:
            error.response?.data || error.cause || "No additional details",
        },
      });

      return {
        success: false,
        error: `Error al procesar el mensaje: ${error.message}`,
      };
    }
  }

  async checkRunStatus(threadId, runId) {
    try {
      return await this.openai.beta.threads.runs.retrieve(threadId, runId);
    } catch (error) {
      logger.error("Error al verificar estado del run:", { error });
      throw error;
    }
  }

  async handleToolCalls(threadId, runId, toolCalls) {
    logger.info("Manejando tool calls...");
    const toolOutputs = [];

    for (const toolCall of toolCalls) {
      const {
        id,
        function: { name, arguments: args },
      } = toolCall;
      logger.info(`Ejecutando función ${name} con argumentos:`, {
        args,
        callId: id,
      });

      try {
        const parsedArgs = JSON.parse(args);
        let output;

        switch (name) {
          case "get_current_time":
            logger.info("Obteniendo hora actual...");
            output = this.handleGetCurrentTime();
            logger.info("Resultado get_current_time:", output);
            break;
          case "get_menu":
            logger.info("Obteniendo menú...");
            output = await this.handleGetMenu();
            break;
          case "create_order":
            logger.info("Creando orden...", { parsedArgs });
            output = await this.handleCreateOrder(parsedArgs);
            break;
          case "check_order_status":
            logger.info("Verificando estado de la orden...");
            output = await this.handleCheckOrderStatus(parsedArgs);
            break;
          case "cancel_order":
            logger.info("Cancelando orden...");
            output = await this.handleCancelOrder(parsedArgs);
            break;
          default:
            output = { error: "Función no implementada" };
        }

        const outputString =
          typeof output === "string" ? output : JSON.stringify(output);

        toolOutputs.push({
          tool_call_id: id,
          output: outputString,
        });

        logger.info(`Tool output agregado:`, {
          tool_call_id: id,
          function_name: name,
          output: outputString,
        });
      } catch (error) {
        logger.error(`Error ejecutando ${name}:`, { error });
        toolOutputs.push({
          tool_call_id: id,
          output: JSON.stringify({
            error: `Error ejecutando ${name}: ${error.message}`,
          }),
        });
      }
    }

    try {
      logger.info("Enviando tool outputs:", { toolOutputs });
      const result = await this.openai.beta.threads.runs.submitToolOutputs(
        threadId,
        runId,
        {
          tool_outputs: toolOutputs,
        }
      );
      logger.info("Tool outputs enviados exitosamente", { result });
      return result;
    } catch (error) {
      logger.error("Error al enviar tool outputs:", {
        error,
        toolOutputs,
        threadId,
        runId,
      });
      throw error;
    }
  }

  async handleGetMenu() {
    const menuResult = await productController.getAllProducts(false);
    if (!menuResult.success) {
      logger.warn("Error obteniendo menú", { error: menuResult.message });
    }
    return menuResult.success ? menuResult.data : { error: menuResult.message };
  }

  async handleCreateOrder(parsedArgs) {
    const orderData = {
      customerName: parsedArgs.customer_name,
      items: parsedArgs.items.map((item) => ({
        product: item.product_id,
        quantity: item.quantity,
      })),
      deliveryType: parsedArgs.delivery_type,
      deliveryAddress: parsedArgs.delivery_address || "",
      comments: parsedArgs.comments || "",
      ...(parsedArgs.delivery_type === "pickup" && parsedArgs.scheduled_time
        ? { scheduledTime: parsedArgs.scheduled_time }
        : {}),
    };

    logger.debug("Creando orden", { orderData });
    const orderResult = await orderController.create(orderData);
    if (orderResult.success) {
      return {
        ...orderResult,
        subscribeToOrder: orderResult.data.orderNumber,
      };
    }

    return orderResult;
  }

  async handleCheckOrderStatus(parsedArgs) {
    const orderStatusResult = await orderController.getOrderById(
      parsedArgs.order_number,
      parsedArgs.customer_name
    );

    if (!orderStatusResult.success) {
      logger.warn("Error al verificar estado de orden", {
        orderNumber: parsedArgs.order_number,
        error: orderStatusResult.message,
      });
      return orderStatusResult;
    }

    const order = orderStatusResult.data;
    return {
      success: true,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      items: order.items.map((item) => ({
        product: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalPrice: order.totalPrice,
      deliveryAddress: order.deliveryAddress,
      createdAt: order.createdAt,
    };
  }

  async handleCancelOrder(parsedArgs) {
    const cancelResult = await orderController.updateStatus(
      parsedArgs.order_number,
      "cancelada",
      parsedArgs.customer_name
    );

    if (!cancelResult.success) {
      logger.warn("Error al cancelar orden", {
        orderNumber: parsedArgs.order_number,
        error: cancelResult.message,
      });
    }

    return {
      success: cancelResult.success,
      message: cancelResult.success
        ? "Orden cancelada exitosamente"
        : cancelResult.message,
      orderNumber: cancelResult.success ? cancelResult.data.orderNumber : null,
      status: cancelResult.success ? cancelResult.data.status : null,
    };
  }

  handleGetCurrentTime() {
    const offset = parseInt(process.env.TIMEZONE_OFFSET || "0");

    const now = new Date();

    const adjustedTime = new Date(now.getTime() + offset * 60 * 60 * 1000);

    const hours = String(adjustedTime.getUTCHours()).padStart(2, "0");
    const minutes = String(adjustedTime.getUTCMinutes()).padStart(2, "0");

    const result = {
      current_time: `${hours}:${minutes}`,
    };

    logger.info("Current time result:", result);
    return result;
  }
}

module.exports = new OpenAIService();
