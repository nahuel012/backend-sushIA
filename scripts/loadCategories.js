const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017/sushi-chatbot";

const categories = [
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff89"),
    name: "Entradas",
    description: "Deliciosas entradas para comenzar tu experiencia de sushi.",
    order: 1,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8a"),
    name: "Rollos Clásicos",
    description: "Rollos tradicionales que todos aman.",
    order: 2,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8b"),
    name: "Rollos Especiales",
    description: "Rollos únicos con ingredientes premium.",
    order: 3,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8c"),
    name: "Sushi y Sashimi",
    description: "Nigiris y sashimi preparados con pescado fresco.",
    order: 4,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8d"),
    name: "Poke Bowls",
    description: "Tazones saludables y deliciosos con una base de arroz.",
    order: 5,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8e"),
    name: "Bento Boxes",
    description: "Combinaciones completas en un solo bento.",
    order: 6,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff8f"),
    name: "Ramen y Sopas",
    description: "Sopas tradicionales japonesas, perfectas para cualquier día.",
    order: 7,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff90"),
    name: "Bebidas",
    description: "Bebidas para acompañar tu comida.",
    order: 8,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff91"),
    name: "Postres",
    description: "Dulces japoneses para cerrar con broche de oro.",
    order: 9,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff92"),
    name: "Vegetarianos y Veganos",
    description: "Opciones pensadas para dietas vegetarianas y veganas.",
    order: 10,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff93"),
    name: "Combinados",
    description: "Combos especiales para compartir o disfrutar más variedad.",
    order: 11,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff94"),
    name: "Promociones",
    description: "Ofertas especiales y promociones del día.",
    order: 12,
    available: true,
  },
  {
    _id: new ObjectId("676f0de0bc7253f48c1aff95"),
    name: "Extras y Acompañamientos",
    description: "Complementos para personalizar tu pedido.",
    order: 13,
    available: true,
  },
];

async function loadCategories() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("categories");

    const result = await collection.insertMany(categories, { ordered: true });
  } catch (error) {
    console.error("Error cargando las categorías:", error);
  } finally {
    await client.close();
  }
}

loadCategories();
