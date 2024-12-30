const request = require("supertest");
const { app } = require("../../server");
const { Product, Category } = require("../../src/models");

describe("prueba product endpoints", () => {
  let testCategory;
  let testCategoryInactive;

  beforeEach(async () => {
    testCategory = await new Category({
      name: "test category",
      description: "test description",
    }).save();

    testCategoryInactive = await new Category({
      name: "inactiva",
      description: "test description",
      available: false,
    }).save();
  });

  describe("GET /api/v1/products", () => {
    it("deberiamos obtener productos cuando al menos existe uno", async () => {
      await new Product({
        name: "california roll",
        description: "roll de prueba",
        price: 2500,
        category: testCategory._id,
      }).save();

      const response = await request(app).get("/api/v1/products").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("california roll");
    });

    it("deberia retornar error 404 cuando no tenemos productos", async () => {
      const response = await request(app).get("/api/v1/products").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No se encontraron productos");
    });

    it("deberia obtener solo los productos activos de categorias que tambien esten activas cuando la query es showAll=false", async () => {
      await new Product({
        name: "producto activo",
        description: "test",
        price: 1000,
        category: testCategory._id,
        available: true,
      }).save();

      await new Product({
        name: "producto inactivo",
        description: "test",
        price: 1000,
        category: testCategory._id,
        available: false,
      }).save();

      await new Product({
        name: "producto activo en categoria inactiva",
        description: "test",
        price: 1000,
        category: testCategoryInactive._id,
        available: true,
      });

      const response = await request(app)
        .get("/api/v1/products?showAll=false")
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toBe("producto activo");
    });
  });

  describe("POST /api/v1/products", () => {
    it("deberia crear un nuevo producto correctamente", async () => {
      const productData = {
        name: "nuevo roll",
        description: "descripcion nuevo roll",
        price: 3000,
        category: testCategory._id.toString(),
      };

      const response = await request(app)
        .post("/api/v1/products")
        .send(productData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.category._id.toString()).toBe(
        testCategory._id.toString()
      );
    });

    it("deberia fallar si e l producto no tiene nombre", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send({
          description: "test",
          price: 1000,
          category: testCategory._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("name");
    });

    it("deberia fallar si ingresamos un id de categoria inexistente", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send({
          name: "producto test",
          description: "test",
          price: 1000,
          category: "507f1f77bcf86cd799439011",
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No existe la categoria");
    });

    it("deberia fallar al crear producto con precio negativo", async () => {
      const response = await request(app)
        .post("/api/v1/products")
        .send({
          name: "producto negativo",
          description: "test",
          price: -1000,
          category: testCategory._id.toString(),
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("price");
    });
  });

  describe("PUT /api/v1/products/:id", () => {
    it("deberia de actualizar un producto existente", async () => {
      const product = await new Product({
        name: "roll original",
        description: "test descripcion",
        price: 2000,
        category: testCategory._id,
      }).save();

      const updateData = {
        name: "updated Roll",
        description: "updated description",
        price: 2500,
        category: testCategory._id.toString(),
      };

      const response = await request(app)
        .put(`/api/v1/products/${product._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.price).toBe(updateData.price);
    });

    it("deberia fallar al actualizar producto inexistente", async () => {
      const response = await request(app)
        .put("/api/v1/products/507f1f77bcf86cd799439011")
        .send({
          name: "update Roll",
          description: "update description",
          price: 2500,
          category: testCategory._id.toString(),
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No se encontró");
    });
  });

  describe("PATCH /api/v1/products/:id/deactivate", () => {
    it("deberia desactivar un producto", async () => {
      const product = await new Product({
        name: "test roll",
        description: "test",
        price: 2000,
        category: testCategory._id,
      }).save();

      const response = await request(app)
        .patch(`/api/v1/products/${product._id}/deactivate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(false);
    });

    it("deberia fallar al desactivar un producto ya desactivado", async () => {
      const product = await new Product({
        name: "test roll",
        description: "test",
        price: 2000,
        category: testCategory._id,
        available: false,
      }).save();

      const response = await request(app)
        .patch(`/api/v1/products/${product._id}/deactivate`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("ya se encuentra desactivado");
    });
  });

  describe("PATCH /api/v1/products/:id/activate", () => {
    it("deberia activar un producto desactivado", async () => {
      const product = await new Product({
        name: "test toll",
        description: "test",
        price: 2000,
        category: testCategory._id,
        available: false,
      }).save();

      const response = await request(app)
        .patch(`/api/v1/products/${product._id}/activate`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.available).toBe(true);
    });

    it("deberia fallar al activar un producto ya activado", async () => {
      const product = await new Product({
        name: "test toll",
        description: "test",
        price: 2000,
        category: testCategory._id,
        available: true,
      }).save();

      const response = await request(app)
        .patch(`/api/v1/products/${product._id}/activate`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("ya se encuentra activado");
    });
  });
});
