const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { logger } = require("../middleware/errorHandler");
const { createError } = require("../utils/errors");

/**
 * @swagger
 * components:
 *  schemas:
 *    OrderItem:
 *      type: object
 *      required:
 *        - product
 *        - quantity
 *      properties:
 *        product:
 *          type: string
 *          description: ID del producto
 *        quantity:
 *          type: number
 *          description: Cantidad del producto
 *      example:
 *        product: "507f1f77bcf86cd799439011"
 *        quantity: 2
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Order:
 *      type: object
 *      required:
 *        - customerName
 *        - items
 *        - deliveryType
 *      properties:
 *        orderNumber:
 *          type: number
 *          description: Número de orden (autoincrementable)
 *        customerName:
 *          type: string
 *          description: Nombre del cliente
 *        items:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/OrderItem'
 *        status:
 *          type: string
 *          enum: [pendiente, rechazada, en proceso, en camino, entregada, cancelada]
 *          default: pendiente
 *        deliveryType:
 *          type: string
 *          enum: [delivery, pickup]
 *          description: Tipo de entrega
 *        deliveryAddress:
 *          type: string
 *          description: Dirección de entrega (requerido si deliveryType es delivery)
 *        scheduledTime:
 *          type: string
 *          format: date-time
 *          description: Hora programada para retiro (requerido si deliveryType es pickup)
 *        comments:
 *          type: string
 *          maxLength: 500
 *          description: Comentarios o instrucciones especiales para el pedido
 *        totalPrice:
 *          type: number
 *          description: Precio total de la orden
 *      example:
 *        orderNumber: 1
 *        customerName: Juan Pérez
 *        items:
 *          - product: 123456789123465
 *            quantity: 2
 *        status: pendiente
 *        deliveryType: delivery
 *        deliveryAddress: Av. Sushi Master 123
 *        comments: Sin wasabi por favor
 *        totalPrice: 6400
 */
/**
 * @swagger
 * /api/v1/orders:
 *  get:
 *    summary: Obtener todas las órdenes
 *    tags: [Orders]
 *    parameters:
 *      - in: query
 *        name: includeCompleted
 *        schema:
 *          type: boolean
 *        description: Si es true, incluye órdenes completadas y rechazadas
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *        description: Filtrar por nombre del cliente
 *    responses:
 *      200:
 *        description: Lista de órdenes
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                status:
 *                  type: number
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Order'
 *      404:
 *        description: No se encontraron órdenes
 *      500:
 *        description: Error del servidor
 */
router.get("/", async (req, res, next) => {
  try {
    const { includeCompleted, name } = req.query;
    const result = await orderController.getAllOrders(
      includeCompleted === "true",
      name
    );
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{orderNumber}:
 *  get:
 *    summary: Obtener una orden por su número y nombre del cliente
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: orderNumber
 *        schema:
 *          type: number
 *        required: true
 *        description: Número de la orden
 *      - in: query
 *        name: customerName
 *        schema:
 *          type: string
 *        required: true
 *        description: Nombre del cliente que realizó la orden
 *    responses:
 *      200:
 *        description: Orden encontrada
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                status:
 *                  type: number
 *                data:
 *                  $ref: '#/components/schemas/Order'
 *      400:
 *        description: Faltan datos requeridos
 *      404:
 *        description: Orden no encontrada
 *      500:
 *        description: Error del servidor
 */
router.get("/:orderNumber", async (req, res, next) => {
  try {
    const { customerName } = req.query;
    const result = await orderController.getOrderById(
      parseInt(req.params.orderNumber),
      customerName
    );
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders:
 *  post:
 *    summary: Crear una nueva orden
 *    tags: [Orders]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - customerName
 *              - items
 *              - deliveryAddress
 *            properties:
 *              customerName:
 *                type: string
 *              items:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/OrderItem'
 *              deliveryAddress:
 *                type: string
 *    responses:
 *      201:
 *        description: Orden creada correctamente
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                status:
 *                  type: number
 *                data:
 *                  $ref: '#/components/schemas/Order'
 *      400:
 *        description: Datos inválidos
 *      500:
 *        description: Error del servidor
 */
router.post("/", async (req, res, next) => {
  try {
    const result = await orderController.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/orders/{orderNumber}/status:
 *  patch:
 *    summary: Actualizar el estado de una orden
 *    tags: [Orders]
 *    parameters:
 *      - in: path
 *        name: orderNumber
 *        schema:
 *          type: number
 *        required: true
 *        description: Número de la orden
 *      - in: query
 *        name: customerName
 *        schema:
 *          type: string
 *        required: true
 *        description: Nombre del cliente que realizó la orden
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - status
 *            properties:
 *              status:
 *                type: string
 *                enum: [pendiente, rechazada, en proceso, en camino, entregada, cancelada]
 *                description: Nuevo estado de la orden. Solo se pueden cancelar órdenes en estado pendiente.
 *    responses:
 *      200:
 *        description: Estado de la orden actualizado
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                status:
 *                  type: number
 *                data:
 *                  $ref: '#/components/schemas/Order'
 *      400:
 *        description: Estado inválido o la orden no puede ser cancelada
 *      404:
 *        description: Orden no encontrada
 *      500:
 *        description: Error del servidor
 */
router.patch("/:orderNumber/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const { customerName } = req.query;

    if (!customerName) {
      logger.warn("Se requiere el nombre del cliente", {
        customerName,
      });
      throw createError(
        "VALIDATION_ERROR",
        "El nombre del cliente es requerido"
      );
    }

    if (!status) {
      logger.warn("Se requiere el estado", { customerName });
      throw createError("VALIDATION_ERROR", "El estado es requerido");
    }

    const result = await orderController.updateStatus(
      parseInt(req.params.orderNumber),
      status,
      customerName
    );
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
