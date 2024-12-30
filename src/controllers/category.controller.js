const { default: mongoose } = require("mongoose");
const { logger } = require("../middleware/errorHandler");
const { createError } = require("../utils/errors");
const { Category } = require("../models");

const categoryController = {
  getAllCategories: async (showAll = false) => {
    logger.info("Obteniendo todas las categorías", { showAll });
    try {
      const filter = showAll ? {} : { available: true };
      const categories = await Category.find(filter).sort("order");

      if (categories.length === 0) {
        logger.warn("No se encontraron categorías", {
          showAll,
        });
        throw createError("NOT_FOUND", "No se encontraron categorías");
      }

      logger.info("Categorías encontradas", {
        count: categories.length,
        showAll,
      });
      return {
        success: true,
        status: 200,
        message: "Categorias encontradas",
        data: categories,
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

  create: async (categoryData) => {
    logger.info("Creando una categoría...", { categoryData });

    try {
      const validation = validationData(categoryData);
      if (!validation.success) {
        logger.warn("Validacion fallida al crear la categoría", {
          errors: validation.message,
          categoryData,
        });
        throw createError("VALIDATION_ERROR", validation.message);
      }

      const existingCategory = await Category.findOne({
        name: validation.data.name,
      });

      if (existingCategory) {
        logger.warn("Ya existe una categoría con ese nombre", {
          categoryName: validation.data.name,
        });
        throw createError(
          "VALIDATION_ERROR",
          "Ya existe una categoría con ese nombre"
        );
      }

      const newCategory = new Category(validation.data);
      await newCategory.save();
      logger.info("Categoría creada correctamente", {
        categoryName: newCategory.name,
      });

      return {
        success: true,
        status: 201,
        message: "Categoría creada correctamente",
        data: newCategory,
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

  update: async (id, categoryData) => {
    logger.info("Actualizando una categoría...", { id, categoryData });
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn("ID de categoría inválido", { id });
        throw createError("VALIDATION_ERROR", "ID de categoría inválido");
      }

      const validation = validationData(categoryData, true);
      if (!validation.success) {
        logger.warn("Validacion fallida al actualizar la categoría", {
          errors: validation.message,
          categoryData,
        });
        throw createError("VALIDATION_ERROR", validation.message);
      }

      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        logger.warn("No se encontró la categoría", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró la categoría");
      }

      if (
        validation.data.name &&
        validation.data.name !== existingCategory.name
      ) {
        const duplicatedCategory = await Category.findOne({
          name: validation.data.name,
          _id: { $ne: id },
        });
        if (duplicatedCategory) {
          logger.warn("Ya existe una categoría con ese nombre", {
            categoryName: validation.data.name,
          });
          throw createError(
            "VALIDATION_ERROR",
            "Ya existe una categoría con ese nombre"
          );
        }
      }

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        validation.data,
        { new: true }
      );
      logger.info("Categoría actualizada correctamente", {
        previousCategoryName: existingCategory.name,
        newCategoryName: updatedCategory.name,
      });

      return {
        success: true,
        status: 200,
        message: "Categoría actualizada correctamente",
        data: updatedCategory,
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
    logger.info("Desactivando una categoría...", { id });
    try {
      const category = await Category.findById(id);
      if (!category) {
        logger.warn("No se encontró la categoría", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró la categoría");
      }

      if (!category.available) {
        logger.warn("La categoría ya se encuentra desactivada", {
          id,
        });
        throw createError(
          "VALIDATION_ERROR",
          "La categoría ya se encuentra desactivada"
        );
      }

      category.available = false;
      await category.save();
      logger.info("Categoría desactivada correctamente", {
        categoryName: category.name,
      });

      return {
        success: true,
        status: 200,
        message: "Categoría desactivada correctamente",
        data: category,
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
    logger.info("Activando una categoría...", { id });
    try {
      const category = await Category.findById(id);
      if (!category) {
        logger.warn("No se encontró la categoría", {
          id,
        });
        throw createError("NOT_FOUND", "No se encontró la categoría");
      }

      if (category.available) {
        logger.warn("La categoría ya se encuentra activada", {
          id,
        });
        throw createError(
          "VALIDATION_ERROR",
          "La categoría ya se encuentra activada"
        );
      }

      category.available = true;
      await category.save();
      logger.info("Categoría activada correctamente", {
        categoryName: category.name,
      });

      return {
        success: true,
        status: 200,
        message: "Categoría activada correctamente",
        data: category,
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
  logger.info("Validando datos de categoría...", { data, isUpdate });
  const fieldValidations = {
    name: {
      required: !isUpdate,
      type: "string",
      validate: (value) => value.trim().length > 0,
    },
    description: {
      required: false,
      type: "string",
    },
    order: {
      type: "number",
      validate: (value) => value >= 0,
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

  logger.info("Datos de categoría validados correctamente");
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

module.exports = categoryController;
