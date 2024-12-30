const request = require("supertest");
const { app } = require("../../server");
const { Order, Product, Category } = require("../../src/models");

describe("prueba order endpoints", () => {
  let testCategory;
  let testProduct;

  beforeEach(async () => {
    testCategory = await new Category({
      name: "test category",
      description: "test description",
    }).save();

    testProduct = await new Product({
      name: "california roll",
      description: "roll de prueba",
      price: 2500,
      category: testCategory._id,
    }).save();
  });

  describe("GET /api/v1/orders", () => {
    it("deberia obtener las ordenes cuando exista al menos una", async () => {
      await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 2,
          },
        ],
        totalPrice: 5000,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app).get("/api/v1/orders").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customerName).toBe("test customer");
    });

    it("deberia devolver error 404 cuando no hay ordenes", async () => {
      const response = await request(app).get("/api/v1/orders").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("No se encontraron órdenes");
    });

    it("deberia filtrar ordenes por nombre de cliente", async () => {
      await Promise.all([
        new Order({
          customerName: "pepe",
          items: [
            {
              product: testProduct._id,
              quantity: 1,
            },
          ],
          totalPrice: 2500,
          deliveryType: "delivery",
          deliveryAddress: "address 1",
        }).save(),
        new Order({
          customerName: "raul",
          items: [
            {
              product: testProduct._id,
              quantity: 1,
            },
          ],
          totalPrice: 2500,
          deliveryType: "delivery",
          deliveryAddress: "address 2",
        }).save(),
      ]);

      const response = await request(app)
        .get("/api/v1/orders?name=pepe")
        .expect(200);

      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].customerName).toBe("pepe");
    });
  });

  describe("GET /api/v1/orders/:orderNumber", () => {
    it("deberia obtener una orden especifica opr numero y nombre", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app)
        .get(`/api/v1/orders/${order.orderNumber}`)
        .query({ customerName: "test customer" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBe(order.orderNumber);
    });

    it("deberia fallar al buscar orden con nombre incorrecto", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app)
        .get(`/api/v1/orders/${order.orderNumber}`)
        .query({ customerName: "customer name" })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No se encontró la orden");
    });
  });

  describe("POST /api/v1/orders", () => {
    it("deberia crear una orden correctamente", async () => {
      const orderData = {
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 2,
          },
        ],
        deliveryType: "delivery",
      };

      const response = await request(app)
        .post("/api/v1/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customerName).toBe(orderData.customerName);
      expect(response.body.data.totalPrice).toBe(testProduct.price * 2);
    });

    it("deberia fallar al crear una orden sin productos", async () => {
      const response = await request(app)
        .post("/api/v1/orders")
        .send({
          customerName: "test customer",
          deliveryType: "delivery",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("items");
    });
  });

  describe("PATCH /api/v1/orders/:orderNumber/status", () => {
    it("deberia actualizar el estado de una orden", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app)
        .patch(`/api/v1/orders/${order.orderNumber}/status`)
        .query({ customerName: "test customer" })
        .send({ status: "en proceso" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("en proceso");
    });

    it("deberia fallar al cancelar una orden que no esta pendiente", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
        status: "en proceso",
      }).save();

      const response = await request(app)
        .patch(`/api/v1/orders/${order.orderNumber}/status`)
        .query({ customerName: "test customer" })
        .send({ status: "cancelada" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Solo se pueden cancelar órdenes en estado pendiente"
      );
    });

    it("deberia fallar al actualizar una orden con un status invalido", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app)
        .patch(`/api/v1/orders/${order.orderNumber}/status`)
        .query({ customerName: "test customer" })
        .send({ status: "estado_invalido" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Estado de orden inválido");
    });

    it("deberia fallar al actualizar orden sin nombre de cliente", async () => {
      const order = await new Order({
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: 2500,
        deliveryType: "delivery",
        deliveryAddress: "test address",
      }).save();

      const response = await request(app)
        .patch(`/api/v1/orders/${order.orderNumber}/status`)
        .send({ status: "en proceso" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("nombre del cliente");
    });

    it("deberia fallar al actualizar orden inexistente", async () => {
      const response = await request(app)
        .patch("/api/v1/orders/999999/status")
        .query({ customerName: "test customer" })
        .send({ status: "en proceso" })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No se encontró la orden");
    });
  });

  describe("verificamos el calculo de precios", () => {
    it("debería calcular correctamente el precio total con múltiples items", async () => {
      const product2 = await new Product({
        name: "segundo roll",
        description: "otro roll de prueba",
        price: 3000,
        category: testCategory._id,
      }).save();

      const orderData = {
        customerName: "test customer",
        items: [
          {
            product: testProduct._id,
            quantity: 2,
          },
          {
            product: product2._id,
            quantity: 1,
          },
        ],
        deliveryType: "delivery",
        deliveryAddress: "Test Address",
      };

      const expectedTotal = testProduct.price * 2 + product2.price * 1;

      const response = await request(app)
        .post("/api/v1/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalPrice).toBe(expectedTotal);
    });
  });
});
