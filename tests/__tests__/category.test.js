const request = require("supertest");
const { app } = require("../../server");
const { Category } = require("../../src/models");
const { setupTestCategory } = require("../fixtures/database");

describe("prueba category endpoints", () => {
  describe("GET /api/v1/categories", () => {
    it("deberiamos obtener todas las categorias cuando existe al menos 1", async () => {
      // preparamps
      await setupTestCategory();

      // ejecutamos
      const response = await request(app).get("/api/v1/categories").expect(200);

      // verificacion
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("Rolls");
    });

    it("deberia retornar error 404 si no tenemos categorias", async () => {
      const response = await request(app).get("/api/v1/categories").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No se encontraron categorías");
    });

    it("deberia solo mostrar las categorias activas cuando la query es showAll=false", async () => {
      const category1 = new Category({
        name: "activa",
        description: "categoria activa",
        available: true,
      });
      const category2 = new Category({
        name: "inactiva",
        description: "categoria inactiva",
        available: false,
      });
      await category1.save();
      await category2.save();

      const response = await request(app)
        .get("/api/v1/categories?showAll=false")
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("activa");
    });
  });

  describe("POST /api/v1/categories", () => {
    it("si ponemos datos validos, deberia crear una nueva categoria", async () => {
      const categoryData = {
        name: "bebidas",
        description: "categoria bebidas",
        order: 2,
      };

      const response = await request(app)
        .post("/api/v1/categories")
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);

      // verificamos en la base de datos
      const category = await Category.findById(response.body.data._id);
      expect(category).not.toBeNull();
      expect(category.name).toBe(categoryData.name);
    });

    it("si la volvemos a crear, deberia de fallar", async () => {
      // creamos una categoria bebidas
      await new Category({
        name: "bebidas",
        description: "categoria bebidas",
        order: 2,
      }).save();

      // la volvemos a crear
      const response = await request(app)
        .post("/api/v1/categories")
        .send({
          name: "bebidas",
          description: "categoria repetida",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Ya existe una categoría con ese nombre"
      );
    });

    it("deberia fallar al crear categoria sin nombre", async () => {
      const response = await request(app)
        .post("/api/v1/categories")
        .send({
          description: "categoria sin nombre",
          order: 1,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("name");
    });
  });

  describe("PUT /api/v1/categories/:id", () => {
    it("deberia actualizar una categoria existente", async () => {
      const category = await setupTestCategory();

      const updateData = {
        name: "Rolls actualizada",
        description: "nueva descripcion",
      };

      const response = await request(app)
        .put(`/api/v1/categories/${category._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it("deberia fallar si intentamos actualizar una categoria que no existe", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/v1/categories/${fakeId}`)
        .send({
          name: "test",
          description: "test",
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/categories/:id/deactivate", () => {
    it("deberia desactivar la categoria", async () => {
      const category = await setupTestCategory();

      const response = await request(app)
        .patch(`/api/v1/categories/${category._id}/deactivate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(false);
    });
  });

  describe("PATCH /api/v1/categories/:id/activate", () => {
    it("deberia activar la categoria", async () => {
      const category = await new Category({
        name: "inactiva",
        description: "categoria inactiva",
        available: false,
      }).save();

      const response = await request(app)
        .patch(`/api/v1/categories/${category._id}/activate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });
  });
});
