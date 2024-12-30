const { default: mongoose } = require("mongoose");
const { Product, Category } = require("../models");
const { logger } = require("../middleware/errorHandler");
const { createError } = require("../utils/errors");

const productController = {
  getAllProducts: async (showAll = false) => {
    logger.info("Obteniendo todos los productos", { showAll });
    try {
      const activeCategories = !showAll
        ? await Category.find({ available: true }).select("_id")
        : await Category.find().select("_id");

      const activeCategoriesIds = activeCategories.map(
        (category) => category._id
      );

      const filter = showAll
        ? {}
        : { available: true, category: { $in: activeCategoriesIds } };

      const products = await Product.find(filter).populate({
        path: "category",
      });

      if (products.length === 0) {
        logger.warn("No se encontraron productos", {
          showAll,
        });
        throw createError("NOT_FOUND", "No se encontraron productos");
      }

      const sortedProducts = products.sort(
        (a, b) => a.category.order - b.category.order
      );

      logger.info("Productos encontrados", {
        count: products.length,
        showAll,
      });
      return {
        success: true,
        status: 200,
        message: "Productos encontrados",
        data: sortedProducts,
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

  create: async (productData) => {
    logger.info("Creando un producto...", { productData });
    try {
      const validation = validationData(productData);
      if (!validation.success) {
        logger.warn("Validacion fallida al crear el producto", {
          errors: validation.message,
          productData,
        });
        throw createError("VALIDATION_ERROR", validation.message);
      }

      if (!mongoose.Types.ObjectId.isValid(validation.data.category)) {
        logger.warn("ID de categoría inválido", {
          categoryId: validation.data.category,
        });
        throw createError("VALIDATION_ERROR", "ID de categoría inválido");
      }

      const category = await Category.findById(validation.data.category);
      if (!category) {
        logger.warn("No existe la categoria que intenta asociar", {
          categoryId: validation.data.category,
        });
        throw createError(
          "NOT_FOUND",
          "No existe la categoria que intenta asociar"
        );
      }

      if (!category.available) {
        logger.warn("La categoría no está disponible", {
          categoryId: validation.data.category,
        });
        throw createError("NOT_FOUND", "La categoría no está disponible");
      }

      const newProduct = new Product(validation.data);
      await newProduct.save();

      const populatedProduct = await Product.findById(newProduct._id).populate(
        "category"
      );

      logger.info("Producto creado correctamente", {
        productName: populatedProduct.name,
      });

      return {
        success: true,
        status: 201,
        message: "Producto creado correctamente",
        data: populatedProduct,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }

      logger.error("Error al crear producto:", error);

      if (process.env.NODE_ENV === "development") {
        throw createError(
          "INTERNAL_ERROR",
          `Error del servidor: ${error.message}`
        );
      }
      throw createError("INTERNAL_ERROR", "Error interno del servidor");
    }
  },

  update: async (id, productData) => {
    logger.info("Actualizando un producto...", { id, productData });
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn("ID de producto inválido", { id });
        throw createError("VALIDATION_ERROR", "ID de producto inválido");
      }
      const validation = validationData(productData, true);
      if (!validation.success) {
        logger.warn("Validacion fallida al actualizar el producto", {
          errors: validation.message,
          productData,
        });
        throw createError("VALIDATION_ERROR", validation.message);
      }

      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        logger.warn("No se encontró el producto", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró el producto");
      }

      if (!mongoose.Types.ObjectId.isValid(validation.data.category)) {
        logger.warn("ID de categoría inválido", {
          categoryId: validation.data.category,
        });
        throw createError("VALIDATION", "ID de categoría inválido");
      }

      const category = await Category.findById(validation.data.category);
      if (!category) {
        logger.warn("No existe la categoria que intenta asociar", {
          categoryId: validation.data.category,
        });
        throw createError(
          "NOT_FOUND",
          "No existe la categoria que intenta asociar"
        );
      }

      if (!category.available) {
        logger.warn("La categoría no está disponible", {
          categoryId: validation.data.category,
        });
        throw createError("NOT_FOUND", "La categoría no está disponible");
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        validation.data,
        { new: true }
      ).populate("category");
      logger.info("Producto actualizado correctamente", {
        previousProductName: existingProduct.name,
        newProductName: updatedProduct.name,
      });

      return {
        success: true,
        status: 200,
        message: "Producto actualizado correctamente",
        data: updatedProduct,
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

  delete: async (id) => {
    logger.info("Desactivando un producto...", { id });
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn("ID de producto inválido", { id });
        throw createError("VALIDATION_ERROR", "ID de producto inválido");
      }
      const product = await Product.findById(id);
      if (!product) {
        logger.warn("No se encontró el producto", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró el producto");
      }

      if (!product.available) {
        logger.warn("El producto ya se encuentra desactivado", {
          id,
        });
        throw createError(
          "VALIDATION_ERROR",
          "El producto ya se encuentra desactivado"
        );
      }

      product.available = false;
      await product.save();

      logger.info("Producto desactivado correctamente", {
        productName: product.name,
      });

      return {
        success: true,
        status: 200,
        message: "Producto desactivado correctamente",
        data: product,
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

  activate: async (id) => {
    logger.info("Activando un producto...", { id });
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn("ID de producto inválido", { id });
        throw createError("VALIDATION_ERROR", "ID de producto inválido");
      }
      const product = await Product.findById(id);
      if (!product) {
        logger.warn("No se encontró el producto", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró el producto");
      }

      if (product.available) {
        logger.warn("El producto ya se encuentra activado", {
          id,
        });
        throw createError(
          "VALIDATION_ERROR",
          "El producto ya se encuentra activado"
        );
      }

      product.available = true;
      await product.save();

      return {
        success: true,
        status: 200,
        message: "Producto activado correctamente",
        data: product,
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

const validationData = (data, isUpdate = false) => {
  logger.info("Validando datos de producto...", { data, isUpdate });
  const fieldValidations = {
    name: {
      required: !isUpdate,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    description: {
      required: !isUpdate,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    price: {
      required: !isUpdate,
      type: "number",
      validate: (value) => value >= 0,
    },
    category: {
      required: !isUpdate,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    image: {
      required: false,
      type: "string",
    },
    available: {
      required: false,
      type: "boolean",
    },
  };

  const allowedFields = Object.keys(fieldValidations);
  const invalidFields = Object.keys(data).filter(
    (key) => !allowedFields.includes(key)
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

    if (typeof value !== rules.type) {
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

  logger.info("Datos de producto validados correctamente");
  return {
    success: true,
    data: allowedFields.reduce((obj, field) => {
      if (data[field] !== undefined) {
        obj[field] = data[field];
      }
      return obj;
    }, {}),
  };
};

module.exports = productController;
