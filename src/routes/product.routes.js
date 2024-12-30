const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

/**
 * @swagger
 * components:
 *  schemas:
 *    Product:
 *      type: object
 *      required:
 *        - name
 *        - description
 *        - price
 *        - category
 *      properties:
 *        name:
 *          type: string
 *          description: Nombre del producto
 *        description:
 *          type: string
 *          description: Descripción del producto
 *        price:
 *          type: number
 *          description: Precio del producto
 *        category:
 *          type: string
 *          description: ID de la categoría a la que pertenece el producto
 *        image:
 *          type: string
 *          description: URL de la imagen del producto
 *        available:
 *          type: boolean
 *          description: Indica si el producto está disponible
 *      example:
 *        name: California Roll
 *        description: Coca-Cola 2.5lts
 *        price: 3200
 *        category: 1111111111111111
 *        image: "https://example.com/coca-cola-25lts.jpg"
 *        available: true
 */

/**
 * @swagger
 * /api/v1/products:
 *  get:
 *    summary: Obtener todos los productos
 *    tags: [Products]
 *    parameters:
 *      - in: query
 *        name: showAll
 *        schema:
 *          type: boolean
 *        description: Si es true, incluye Productos desactivadas
 *    responses:
 *      200:
 *        description: Lista de productos
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
 *                    $ref: '#/components/schemas/Product'
 *      404:
 *        description: No hay productos disponibles
 *      500:
 *        description: Error del servidor
 */
router.get("/", async (req, res, next) => {
  try {
    const showAll = req.query.showAll === "true";
    const result = await productController.getAllProducts(showAll);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products:
 *  post:
 *    summary: Crear un nuevo producto
 *    tags: [Products]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *    responses:
 *      201:
 *        description: Producto creado correctamente
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                message:
 *                  type: string
 *                data:
 *                  $ref: '#/components/schemas/Product'
 *      400:
 *        description: Datos inválidos
 *      500:
 *        description: Error del servidor
 */
router.post("/", async (req, res, next) => {
  try {
    const result = await productController.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *  put:
 *    summary: Actualizar un producto
 *    tags: [Products]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del producto
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Product'
 *    responses:
 *      200:
 *        description: Producto actualizado correctamente
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
 *                  $ref: '#/components/schemas/Product'
 *                message:
 *                  type: string
 *      400:
 *        description: Datos inválidos
 *      404:
 *        description: Producto no encontrado
 *      500:
 *        description: Error del servidor
 */
router.put("/:id", async (req, res, next) => {
  try {
    const result = await productController.update(req.params.id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}/deactivate:
 *  patch:
 *    summary: Desactivar un producto
 *    tags: [Products]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del producto
 *    responses:
 *      200:
 *        description: Producto desactivado correctamente
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
 *                  $ref: '#/components/schemas/Product'
 *                message:
 *                  type: string
 *      400:
 *        description: El producto ya está desactivado
 *      404:
 *        description: Producto no encontrado
 *      500:
 *        description: Error del servidor
 */
router.patch("/:id/deactivate", async (req, res, next) => {
  try {
    const result = await productController.delete(req.params.id);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/products/{id}/activate:
 *  patch:
 *    summary: Activar un producto
 *    tags: [Products]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ID del producto
 *    responses:
 *      200:
 *        description: Producto activado correctamente
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
 *                  $ref: '#/components/schemas/Product'
 *                message:
 *                  type: string
 *      400:
 *        description: El producto ya está activado
 *      404:
 *        description: Producto no encontrado
 *      500:
 *        description: Error del servidor
 */
router.patch("/:id/activate", async (req, res, next) => {
  try {
    const result = await productController.activate(req.params.id);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
