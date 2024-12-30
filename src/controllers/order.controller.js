const { Order, Product } = require("../models");
const { createError } = require("../utils/errors");
const { logger } = require("../middleware/errorHandler");
const eventService = require("../services/event.service");

const orderController = {
  getAllOrders: async (includeCompleted = false, filterName = "") => {
    logger.info("Obteniendo ordenes", { includeCompleted, filterName });
    try {
      let filter = {};

      if (!includeCompleted) {
        filter.status = {
          $in: ["pendiente", "en proceso", "en camino"],
        };
      }

      if (filterName) {
        filter.customerName = new RegExp(filterName, "i");
      }

      const orders = await Order.find(filter)
        .populate({
          path: "items.product",
          populate: {
            path: "category",
          },
        })
        .sort({ createdAt: -1 });

      if (orders.length === 0) {
        logger.warn("No se encontraron ordenes", { filter });
        throw createError("NOT_FOUND", "No se encontraron órdenes");
      }

      logger.info("Ordenes encontradas", { count: orders.length });
      return {
        success: true,
        status: 200,
        message: "Órdenes encontradas",
        data: orders,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      if (process.env.NODE_ENV === "development") {
        throw createError(
          "INTERNAL_ERROR",
          `Error del servidor: ${error.message}`
        );
      }
      throw createError("INTERNAL_ERROR", "Error interno del servidor");
    }
  },

  create: async (orderData) => {
    logger.info("Creando orden... ", {
      customerName: orderData.customerName,
      itemsCount: orderData.items?.length,
    });

    try {
      const validation = await validationData(orderData);
      if (!validation.success) {
        logger.warn("Validacion fallida al crear la orden", {
          errors: validation.message,
          orderData,
        });

        throw createError("VALIDATION_ERROR", validation.message);
      }

      const orderItems = [];
      let totalPrice = 0;

      for (const item of validation.data.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          logger.error("producto no encontrado", { productId: item.product });
          throw createError(
            "NOT_FOUND",
            `El producto con ID ${item.product} no existe`
          );
        }

        if (!product.available) {
          logger.warn("producto no disponible", {
            productId: item.product,
            productName: product.name,
          });
          throw createError(
            "PRODUCT_UNAVAILABLE",
            `El producto ${product.name} no está disponible`
          );
        }

        totalPrice += product.price * item.quantity;

        orderItems.push({
          product: item.product,
          quantity: item.quantity,
        });
      }

      const newOrder = new Order({
        customerName: validation.data.customerName,
        items: orderItems,
        deliveryType: validation.data.deliveryType,
        deliveryAddress: validation.data.deliveryAddress,
        scheduledTime: validation.data.scheduledTime,
        comments: validation.data.comments || "",
        totalPrice,
        status: "pendiente",
      });

      await newOrder.save();
      logger.info("Orden creada correctamente", {
        orderNumber: newOrder.orderNumber,
        totalPrice,
        customerName: newOrder.customerNAme,
      });

      const populatedOrder = await Order.findById(newOrder._id).populate({
        path: "items.product",
        populate: {
          path: "category",
        },
      });

      return {
        success: true,
        status: 201,
        message: "Orden creada correctamente",
        data: populatedOrder,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      if (process.env.NODE_ENV === "development") {
        throw createError(
          "INTERNAL_ERROR",
          `Error del servidor: ${error.message}`
        );
      }
      throw createError("INTERNAL_ERROR", "Error interno del servidor");
    }
  },

  getOrderById: async (orderNumber, customerName) => {
    logger.info("Buscando orden especifica", {
      orderNumber,
      customerName,
    });
    try {
      if (!orderNumber || !customerName) {
        logger.warn("Se requiere el número de orden y el nombre del cliente", {
          orderNumber,
          customerName,
        });
        throw createError(
          "VALIDATION_ERROR",
          "Se requiere el número de orden y el nombre del cliente"
        );
      }

      const order = await Order.findOne({
        orderNumber,
        customerName: customerName.trim().toLowerCase(),
      }).populate({
        path: "items.product",
        populate: {
          path: "category",
        },
      });

      if (!order) {
        logger.warn("No se encontró la orden", {
          orderNumber,
          customerName,
        });
        throw createError(
          "NOT_FOUND",
          "No se encontró la orden con los datos proporcionados"
        );
      }

      logger.info("Orden encontrada", {
        orderNumber,
        customerName,
      });
      return {
        success: true,
        status: 200,
        message: "Orden encontrada",
        data: order,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      if (process.env.NODE_ENV === "development") {
        throw createError(
          "INTERNAL_ERROR",
          `Error del servidor: ${error.message}`
        );
      }
      throw createError("INTERNAL_ERROR", "Error interno del servidor");
    }
  },

  updateStatus: async (orderNumber, newStatus, customerName) => {
    logger.info("Actualizando estado de orden", {
      orderNumber,
      newStatus,
      customerName,
    });
    try {
      const validStatus = [
        "pendiente",
        "rechazada",
        "en proceso",
        "en camino",
        "entregada",
        "cancelada",
        "aceptada",
      ];

      if (!validStatus.includes(newStatus)) {
        logger.warn("Estado de orden inválido", {
          orderNumber,
          newStatus,
          customerName,
        });

        throw createError(
          "VALIDATION_ERROR",
          `Estado de orden inválido: ${newStatus}`
        );
      }

      const order = await Order.findOne({
        orderNumber,
        customerName: customerName.trim().toLowerCase(),
      });

      if (!order) {
        logger.warn("No se encontró la orden para actualizar", {
          orderNumber,
          customerName,
        });
        throw createError("NOT_FOUND", "No se encontró la orden");
      }

      if (newStatus === "cancelada" && order.status !== "pendiente") {
        logger.warn("Intento de cancelar orden no pendiente", {
          orderNumber,
          customerName,
        });
        throw createError(
          "VALIDATION_ERROR",
          "Solo se pueden cancelar órdenes en estado pendiente"
        );
      }

      order.status = newStatus;
      await order.save();

      const updatedOrder = await Order.findById(order._id).populate({
        path: "items.product",
        populate: {
          path: "category",
        },
      });

      eventService.emitOrderUpdate(orderNumber, {
        status: newStatus,
        timestamp: new Date(),
        customerName: order.customerName,
        message: `Tu orden #${orderNumber} ha cambiado a estado: ${newStatus}`,
        totalPrice: order.totalPrice,
        items: updatedOrder.items.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        delivery: {
          type: order.deliveryType,
          address: order.deliveryAddress,
          scheduledTime: order.scheduledTime,
        },
        comments: order.comments,
      });

      logger.info("Estado de la orden actualizado correctamente", {
        orderNumber,
        newStatus,
        customerName,
      });

      return {
        success: true,
        status: 200,
        message: "Estado de la orden actualizado correctamente",
        data: updatedOrder,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      if (process.env.NODE_ENV === "development") {
        throw createError(
          "INTERNAL_ERROR",
          `Error del servidor: ${error.message}`
        );
      }
      throw createError("INTERNAL_ERROR", "Error interno del servidor");
    }
  },
};

const validationData = async (data) => {
  logger.info("Validando datos de orden...", data);
  const fieldValidations = {
    customerName: {
      required: true,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    items: {
      required: true,
      type: "array",
      validate: (value) => value.length > 0,
    },
    deliveryType: {
      required: true,
      type: "string",
      validate: (value) => ["delivery", "pickup"].includes(value),
    },
    deliveryAddress: {
      required: false,
      type: "string",
      validate: (value) => value.trim().length >= 0,
    },
    scheduledTime: {
      required: false,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    comments: {
      required: false,
      type: "string",
      validate: (value) => !value || value.length <= 500,
    },
  };

  const allowedFields = Object.keys(fieldValidations);
  const invalidFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key) && key !== "status"
  );

  if (invalidFields.length > 0) {
    logger.warn("Campos no permitidos", {
      invalidFields,
    });
    return {
      success: false,
      status: 400,
      message: `Campos no permitidos: ${invalidFields.join(", ")}`,
    };
  }

  const missingFields = Object.entries(fieldValidations)
    .filter(([field, rules]) => rules.required && !data.hasOwnProperty(field))
    .map(([field]) => field);

  if (missingFields.length > 0) {
    logger.warn("Campos requeridos faltantes", {
      missingFields,
    });
    return {
      success: false,
      status: 400,
      message: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
    };
  }

  for (const [field, value] of Object.entries(data)) {
    const rules = fieldValidations[field];
    if (!rules) continue;

    if (typeof value !== rules.type && field !== "items") {
      logger.warn("El campo debe ser del tipo", {
        field,
        expectedType: rules.type,
        receivedType: typeof value,
      });
      return {
        success: false,
        status: 400,
        message: `El campo ${field} debe ser tipo ${rules.type}`,
      };
    }

    if (rules.validate && !rules.validate(value)) {
      logger.warn("El campo no cumple con las validaciones requeridas", {
        field,
        value,
      });
      return {
        success: false,
        status: 400,
        message: `El campo ${field} no cumple con las validaciones requeridas`,
      };
    }
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    logger.warn("La orden debe contener al menos un item", {
      items: data.items,
    });
    return {
      success: false,
      status: 400,
      message: "La orden debe contener al menos un item",
    };
  }

  const validatedItems = [];
  for (const item of data.items) {
    if (!item.product || !item.quantity) {
      logger.warn("Cada item debe tener un producto y una cantidad", {
        item,
      });
      return {
        success: false,
        status: 400,
        message: "Cada item debe tener un producto y una cantidad",
      };
    }

    if (typeof item.quantity !== "number" || item.quantity < 1) {
      logger.warn("La cantidad debe ser un número mayor a 0", {
        item,
      });
      return {
        success: false,
        status: 400,
        message: "La cantidad debe ser un número mayor a 0",
      };
    }

    validatedItems.push({
      product: item.product,
      quantity: item.quantity,
    });
  }

  logger.info("Datos de orden validados correctamente");
  return {
    success: true,
    data: {
      customerName: data.customerName.trim().toLowerCase(),
      items: validatedItems,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress?.trim() || "",
      scheduledTime: data.scheduledTime || null,
      comments: data.comments?.trim() || "",
      status: "pendiente",
    },
  };
};

module.exports = orderController;
