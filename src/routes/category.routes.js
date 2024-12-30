const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

/**
 * @swagger
 * components:
 *  schemas:
 *    Category:
 *      type: object
 *      required:
 *        - name
 *      properties:
 *        name:
 *          type: string
 *          description: Nombre de la categoría
 *        description:
 *          type: string
 *          description: Descripción de la categoría
 *        order:
 *          type: number
 *          description: Orden de la categoría
 *        available:
 *          type: boolean
 *          description: Indica si la categoría está disponible o no
 *      example:
 *        name: Bebidas
 *        description: Todo tipo de bebidas
 *        order: 2
 *        available: true
 */

/**
 * @swagger
 * /api/v1/categories:
 *  get:
 *    summary: Obtener todas las categorías
 *    tags: [Categories]
 *    parameters:
 *      - in: query
 *        name: showAll
 *        schema:
 *          type: boolean
 *        description: Si es true, incluye Categorias desactivadas
 *    responses:
 *      200:
 *        description: Lista de categorias disponibles
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
 *                items:
 *                  $ref: '#/components/schemas/Category'
 *
 *      404:
 *        description: No hay categorías disponibles
 *      500:
 *        description: Error del servidor
 */
router.get("/", async (req, res, next) => {
  try {
    const showAll = req.query.showAll === "true";
    const result = await categoryController.getAllCategories(showAll);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/categories:
 *  post:
 *    summary: Crear una nueva categoría
 *    tags: [Categories]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Category'
 *    responses:
 *      201:
 *        description: Categoría creada correctamente
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
 *                  $ref: '#/components/schemas/Category'
 *      400:
 *        description: Datos invalidos o categoría duplicada
 *      500:
 *        description: Error del servidor
 */
router.post("/", async (req, res, next) => {
  try {
    const result = await categoryController.create(req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *  put:
 *    summary: Actualizar una categoría
 *    tags: [Categories]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Id de la categoría
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Category'
 *    responses:
 *      200:
 *        description: Categoría actualizada correctamente
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
 *                  $ref: '#/components/schemas/Category'
 *                message:
 *                  type: string
 *      400:
 *        description: Datos invalidos o categoría duplicada
 *      404:
 *        description: No se encontró la categoría
 *      500:
 *        description: Error del servidor
 */
router.put("/:id", async (req, res, next) => {
  try {
    const result = await categoryController.update(req.params.id, req.body);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}/deactivate:
 *  patch:
 *    summary: Desactivar una categoría
 *    tags: [Categories]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Id de la categoría
 *    responses:
 *      200:
 *        description: Categoría desactivada correctamente
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
 *                  $ref: '#/components/schemas/Category'
 *                message:
 *                  type: string
 *      400:
 *        description: La categoría ya se encuentra desactivada
 *      404:
 *        description: No se encontró la categoría
 *      500:
 *        description: Error del servidor
 */
router.patch("/:id/deactivate", async (req, res, next) => {
  try {
    const result = await categoryController.delete(req.params.id);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/categories/{id}/activate:
 *  patch:
 *    summary: Activar una categoría
 *    tags: [Categories]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Id de la categoría
 *    responses:
 *      200:
 *        description: Categoría activada correctamente
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
 *                  $ref: '#/components/schemas/Category'
 *                message:
 *                  type: string
 *      400:
 *        description: La categoría ya se encuentra activada
 *      404:
 *        description: No se encontró la categoría
 *      500:
 *        description: Error del servidor
 */
router.patch("/:id/activate", async (req, res, next) => {
  try {
    const result = await categoryController.activate(req.params.id);
    return res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
