const { MongoClient, ObjectId } = require("mongodb");

const uri = "mongodb://localhost:27017/sushi-chatbot";

const products = [
  {
    name: "Edamame",
    description: "Frijoles de soya al vapor con un toque de sal.",
    price: 5.99,
    image: "https://source.unsplash.com/featured/?edamame",
    category: new ObjectId("676f0de0bc7253f48c1aff89"),
    available: true,
  },
  {
    name: "Gyozas",
    description: "Empanadillas japonesas rellenas de carne y vegetales.",
    price: 7.99,
    image: "https://source.unsplash.com/featured/?gyoza",
    category: new ObjectId("676f0de0bc7253f48c1aff89"),
    available: true,
  },
  {
    name: "Tempura de Camarón",
    description: "Camarones empanizados y fritos, crujientes por fuera.",
    price: 8.99,
    image: "https://source.unsplash.com/featured/?tempura",
    category: new ObjectId("676f0de0bc7253f48c1aff89"),
    available: true,
  },
  {
    name: "Sopa Miso",
    description: "Sopa tradicional japonesa hecha con pasta de miso.",
    price: 4.99,
    image: "https://source.unsplash.com/featured/?miso",
    category: new ObjectId("676f0de0bc7253f48c1aff89"),
    available: true,
  },
  {
    name: "Yakitori",
    description: "Brochetas de pollo a la parrilla con salsa teriyaki.",
    price: 6.99,
    image: "https://source.unsplash.com/featured/?yakitori",
    category: new ObjectId("676f0de0bc7253f48c1aff89"),
    available: true,
  },
  {
    name: "California Roll",
    description: "Rollo clásico con aguacate, surimi y pepino.",
    price: 12.99,
    image: "https://source.unsplash.com/featured/?california,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8a"),
    available: true,
  },
  {
    name: "Philadelphia Roll",
    description: "Rollo con queso crema, salmón y aguacate.",
    price: 13.99,
    image: "https://source.unsplash.com/featured/?philadelphia,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8a"),
    available: true,
  },
  {
    name: "Spicy Tuna Roll",
    description: "Rollo de atún con un toque picante.",
    price: 14.99,
    image: "https://source.unsplash.com/featured/?spicy,tuna",
    category: new ObjectId("676f0de0bc7253f48c1aff8a"),
    available: true,
  },
  {
    name: "Ebi Tempura Roll",
    description: "Rollo con camarones tempura y aguacate.",
    price: 15.99,
    image: "https://source.unsplash.com/featured/?ebi,tempura",
    category: new ObjectId("676f0de0bc7253f48c1aff8a"),
    available: true,
  },
  {
    name: "Vegetarian Roll",
    description: "Rollo hecho con vegetales frescos.",
    price: 11.99,
    image: "https://source.unsplash.com/featured/?vegetarian,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8a"),
    available: true,
  },
  {
    name: "Dragon Roll",
    description: "Rollo con anguila, aguacate y salsa especial.",
    price: 16.99,
    image: "https://source.unsplash.com/featured/?dragon,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8b"),
    available: true,
  },
  {
    name: "Tiger Roll",
    description: "Rollo con camarón tempura, aguacate y salsa de mango.",
    price: 17.99,
    image: "https://source.unsplash.com/featured/?tiger,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8b"),
    available: true,
  },
  {
    name: "Rainbow Roll",
    description: "Rollo cubierto con una variedad de pescados frescos.",
    price: 18.99,
    image: "https://source.unsplash.com/featured/?rainbow,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8b"),
    available: true,
  },
  {
    name: "Spider Roll",
    description: "Rollo con cangrejo frito y salsa especial.",
    price: 19.99,
    image: "https://source.unsplash.com/featured/?spider,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8b"),
    available: true,
  },
  {
    name: "Volcano Roll",
    description: "Rollo picante con topping de atún flameado.",
    price: 20.99,
    image: "https://source.unsplash.com/featured/?volcano,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff8b"),
    available: true,
  },
  {
    name: "Nigiri de Salmón",
    description: "Delicioso nigiri con rebanadas de salmón fresco.",
    price: 10.99,
    image: "https://source.unsplash.com/featured/?salmon,nigiri",
    category: new ObjectId("676f0de0bc7253f48c1aff8c"),
    available: true,
  },
  {
    name: "Nigiri de Atún",
    description: "Nigiri con exquisitas rebanadas de atún fresco.",
    price: 11.99,
    image: "https://source.unsplash.com/featured/?tuna,nigiri",
    category: new ObjectId("676f0de0bc7253f48c1aff8c"),
    available: true,
  },
  {
    name: "Sashimi de Salmón",
    description: "Rebanadas de salmón fresco servidas al estilo tradicional.",
    price: 15.99,
    image: "https://source.unsplash.com/featured/?salmon,sashimi",
    category: new ObjectId("676f0de0bc7253f48c1aff8c"),
    available: true,
  },
  {
    name: "Sashimi de Atún",
    description: "Rebanadas de atún fresco con textura impecable.",
    price: 16.99,
    image: "https://source.unsplash.com/featured/?tuna,sashimi",
    category: new ObjectId("676f0de0bc7253f48c1aff8c"),
    available: true,
  },
  {
    name: "Sashimi Mixto",
    description: "Variedad de pescados frescos servidos al estilo sashimi.",
    price: 19.99,
    image: "https://source.unsplash.com/featured/?mixed,sashimi",
    category: new ObjectId("676f0de0bc7253f48c1aff8c"),
    available: true,
  },
  {
    name: "Poke Bowl de Salmón",
    description: "Tazón de arroz con salmón fresco, aguacate y edamame.",
    price: 12.99,
    image: "https://source.unsplash.com/featured/?poke,salmon",
    category: new ObjectId("676f0de0bc7253f48c1aff8d"),
    available: true,
  },
  {
    name: "Poke Bowl de Atún",
    description: "Tazón de arroz con atún marinado, pepino y algas.",
    price: 13.99,
    image: "https://source.unsplash.com/featured/?poke,tuna",
    category: new ObjectId("676f0de0bc7253f48c1aff8d"),
    available: true,
  },
  {
    name: "Poke Bowl Mixto",
    description: "Tazón con mezcla de salmón, atún y vegetales frescos.",
    price: 14.99,
    image: "https://source.unsplash.com/featured/?poke,mixed",
    category: new ObjectId("676f0de0bc7253f48c1aff8d"),
    available: true,
  },
  {
    name: "Poke Bowl Vegetariano",
    description: "Tazón con arroz, tofu, aguacate y vegetales frescos.",
    price: 10.99,
    image: "https://source.unsplash.com/featured/?poke,vegetarian",
    category: new ObjectId("676f0de0bc7253f48c1aff8d"),
    available: true,
  },
  {
    name: "Poke Bowl Picante",
    description: "Tazón con pescado fresco y salsa picante especial.",
    price: 14.99,
    image: "https://source.unsplash.com/featured/?poke,spicy",
    category: new ObjectId("676f0de0bc7253f48c1aff8d"),
    available: true,
  },
  {
    name: "Bento Box de Salmón",
    description: "Combinación de sushi, sashimi, arroz y ensalada con salmón.",
    price: 18.99,
    image: "https://source.unsplash.com/featured/?bento,salmon",
    category: new ObjectId("676f0de0bc7253f48c1aff8e"),
    available: true,
  },
  {
    name: "Bento Box de Atún",
    description: "Bento con atún fresco, arroz y guarniciones tradicionales.",
    price: 19.99,
    image: "https://source.unsplash.com/featured/?bento,tuna",
    category: new ObjectId("676f0de0bc7253f48c1aff8e"),
    available: true,
  },
  {
    name: "Bento Box Vegetariano",
    description: "Caja con rollos vegetarianos, ensalada y arroz.",
    price: 17.99,
    image: "https://source.unsplash.com/featured/?bento,vegetarian",
    category: new ObjectId("676f0de0bc7253f48c1aff8e"),
    available: true,
  },
  {
    name: "Bento Box Mixto",
    description: "Mezcla de sushi, sashimi y arroz con pescado fresco.",
    price: 20.99,
    image: "https://source.unsplash.com/featured/?bento,mixed",
    category: new ObjectId("676f0de0bc7253f48c1aff8e"),
    available: true,
  },
  {
    name: "Bento Box Deluxe",
    description: "Selección premium de sushi, sashimi y guarniciones.",
    price: 25.99,
    image: "https://source.unsplash.com/featured/?bento,premium",
    category: new ObjectId("676f0de0bc7253f48c1aff8e"),
    available: true,
  },
  {
    name: "Miso Ramen",
    description: "Ramen con caldo de miso, fideos y vegetales frescos.",
    price: 12.99,
    image: "https://source.unsplash.com/featured/?miso,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff8f"),
    available: true,
  },
  {
    name: "Shoyu Ramen",
    description: "Ramen con caldo de soya y toppings clásicos.",
    price: 13.99,
    image: "https://source.unsplash.com/featured/?shoyu,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff8f"),
    available: true,
  },
  {
    name: "Tonkotsu Ramen",
    description: "Ramen con caldo espeso de cerdo, huevo y chashu.",
    price: 14.99,
    image: "https://source.unsplash.com/featured/?tonkotsu,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff8f"),
    available: true,
  },
  {
    name: "Vegetarian Ramen",
    description: "Ramen con caldo de vegetales, tofu y champiñones.",
    price: 11.99,
    image: "https://source.unsplash.com/featured/?vegetarian,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff8f"),
    available: true,
  },
  {
    name: "Spicy Ramen",
    description:
      "Ramen con un toque picante para los amantes del sabor intenso.",
    price: 13.99,
    image: "https://source.unsplash.com/featured/?spicy,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff8f"),
    available: true,
  },
  {
    name: "Té Verde Japonés",
    description: "Té verde tradicional, ideal para acompañar tus comidas.",
    price: 2.99,
    image: "https://source.unsplash.com/featured/?green,tea",
    category: new ObjectId("676f0de0bc7253f48c1aff90"),
    available: true,
  },
  {
    name: "Sake",
    description: "Bebida tradicional japonesa hecha de arroz fermentado.",
    price: 8.99,
    image: "https://source.unsplash.com/featured/?sake,drink",
    category: new ObjectId("676f0de0bc7253f48c1aff90"),
    available: true,
  },
  {
    name: "Cerveza Japonesa",
    description: "Cerveza importada, ideal para acompañar sushi y ramen.",
    price: 6.99,
    image: "https://source.unsplash.com/featured/?japanese,beer",
    category: new ObjectId("676f0de0bc7253f48c1aff90"),
    available: true,
  },
  {
    name: "Agua Mineral",
    description: "Agua purificada para refrescarte durante tu comida.",
    price: 1.99,
    image: "https://source.unsplash.com/featured/?mineral,water",
    category: new ObjectId("676f0de0bc7253f48c1aff90"),
    available: true,
  },
  {
    name: "Refresco de Lychee",
    description: "Refresco con un toque dulce y refrescante de lychee.",
    price: 3.99,
    image: "https://source.unsplash.com/featured/?lychee,drink",
    category: new ObjectId("676f0de0bc7253f48c1aff90"),
    available: true,
  },
  {
    name: "Mochi de Té Verde",
    description: "Deliciosos pasteles de arroz rellenos de helado de té verde.",
    price: 5.99,
    image: "https://source.unsplash.com/featured/?mochi,green,tea",
    category: new ObjectId("676f0de0bc7253f48c1aff91"),
    available: true,
  },
  {
    name: "Helado de Sésamo Negro",
    description: "Helado único con un sabor intenso y delicioso.",
    price: 4.99,
    image: "https://source.unsplash.com/featured/?black,sesame,icecream",
    category: new ObjectId("676f0de0bc7253f48c1aff91"),
    available: true,
  },
  {
    name: "Cheesecake Japonés",
    description: "Pastel de queso esponjoso al estilo japonés.",
    price: 6.99,
    image: "https://source.unsplash.com/featured/?japanese,cheesecake",
    category: new ObjectId("676f0de0bc7253f48c1aff91"),
    available: true,
  },
  {
    name: "Taiyaki",
    description: "Pastel en forma de pez relleno de pasta de frijol rojo.",
    price: 4.99,
    image: "https://source.unsplash.com/featured/?taiyaki,fish,red,bean",
    category: new ObjectId("676f0de0bc7253f48c1aff91"),
    available: true,
  },
  {
    name: "Dorayaki",
    description: "Panques japoneses rellenos de pasta de frijol dulce.",
    price: 3.99,
    image: "https://source.unsplash.com/featured/?dorayaki,japanese,dessert",
    category: new ObjectId("676f0de0bc7253f48c1aff91"),
    available: true,
  },
  {
    name: "Roll Vegetariano",
    description: "Rollo hecho con pepino, zanahoria y aguacate fresco.",
    price: 10.99,
    image: "https://source.unsplash.com/featured/?vegetarian,roll",
    category: new ObjectId("676f0de0bc7253f48c1aff92"),
    available: true,
  },
  {
    name: "Nigiri de Tofu",
    description: "Nigiri con tofu marinado en salsa especial.",
    price: 9.99,
    image: "https://source.unsplash.com/featured/?tofu,nigiri",
    category: new ObjectId("676f0de0bc7253f48c1aff92"),
    available: true,
  },
  {
    name: "Ramen Vegano",
    description: "Ramen con caldo de vegetales, tofu y champiñones.",
    price: 12.99,
    image: "https://source.unsplash.com/featured/?vegan,ramen",
    category: new ObjectId("676f0de0bc7253f48c1aff92"),
    available: true,
  },
  {
    name: "Sashimi de Zanahoria",
    description: "Rebanadas finas de zanahoria al estilo sashimi.",
    price: 8.99,
    image: "https://source.unsplash.com/featured/?carrot,sashimi",
    category: new ObjectId("676f0de0bc7253f48c1aff92"),
    available: true,
  },
  {
    name: "Poke Bowl Vegano",
    description: "Tazón con arroz, tofu, aguacate y vegetales frescos.",
    price: 11.99,
    image: "https://source.unsplash.com/featured/?vegan,poke,bowl",
    category: new ObjectId("676f0de0bc7253f48c1aff92"),
    available: true,
  },
  {
    name: "Combo Sushi Lovers",
    description: "12 piezas de sushi mixto y 8 piezas de sashimi.",
    price: 29.99,
    image: "https://source.unsplash.com/featured/?sushi,combo",
    category: new ObjectId("676f0de0bc7253f48c1aff93"),
    available: true,
  },
  {
    name: "Combo Vegetariano",
    description: "10 piezas de rollos vegetarianos y 1 sopa miso.",
    price: 19.99,
    image: "https://source.unsplash.com/featured/?vegetarian,combo",
    category: new ObjectId("676f0de0bc7253f48c1aff93"),
    available: true,
  },
  {
    name: "Combo Familiar",
    description: "24 piezas de sushi surtido para compartir.",
    price: 39.99,
    image: "https://source.unsplash.com/featured/?family,sushi,combo",
    category: new ObjectId("676f0de0bc7253f48c1aff93"),
    available: true,
  },
  {
    name: "Combo Deluxe",
    description: "Sushi premium, sashimi y guarniciones.",
    price: 49.99,
    image: "https://source.unsplash.com/featured/?deluxe,sushi,combo",
    category: new ObjectId("676f0de0bc7253f48c1aff93"),
    available: true,
  },
  {
    name: "Combo Ejecutivo",
    description: "8 piezas de sushi, sashimi y una bebida.",
    price: 24.99,
    image: "https://source.unsplash.com/featured/?executive,sushi,combo",
    category: new ObjectId("676f0de0bc7253f48c1aff93"),
    available: true,
  },
  {
    name: "2x1 California Roll",
    description: "Disfruta de 2 rollos al precio de 1.",
    price: 12.99,
    image: "https://source.unsplash.com/featured/?promotion,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff94"),
    available: true,
  },
  {
    name: "Ramen + Bebida",
    description: "Un bowl de ramen con tu bebida favorita incluida.",
    price: 14.99,
    image: "https://source.unsplash.com/featured/?ramen,promotion",
    category: new ObjectId("676f0de0bc7253f48c1aff94"),
    available: true,
  },
  {
    name: "Combo Sushi + Postre",
    description: "Rollo especial y un mochi de té verde.",
    price: 16.99,
    image: "https://source.unsplash.com/featured/?sushi,dessert",
    category: new ObjectId("676f0de0bc7253f48c1aff94"),
    available: true,
  },
  {
    name: "Happy Hour Sake",
    description: "Descuento en sake durante la tarde.",
    price: 6.99,
    image: "https://source.unsplash.com/featured/?sake,happyhour",
    category: new ObjectId("676f0de0bc7253f48c1aff94"),
    available: true,
  },
  {
    name: "Combo Pareja",
    description: "16 piezas de sushi y dos bebidas.",
    price: 28.99,
    image: "https://source.unsplash.com/featured/?couple,sushi",
    category: new ObjectId("676f0de0bc7253f48c1aff94"),
    available: true,
  },
  {
    name: "Jengibre",
    description: "Jengibre encurtido para acompañar tus platos.",
    price: 0.99,
    image: "https://source.unsplash.com/featured/?ginger",
    category: new ObjectId("676f0de0bc7253f48c1aff95"),
    available: true,
  },
  {
    name: "Wasabi",
    description: "Wasabi fresco para un toque picante.",
    price: 0.99,
    image: "https://source.unsplash.com/featured/?wasabi",
    category: new ObjectId("676f0de0bc7253f48c1aff95"),
    available: true,
  },
  {
    name: "Salsa de Soya",
    description: "Salsa de soya para realzar el sabor de tus platos.",
    price: 0.99,
    image: "https://source.unsplash.com/featured/?soy,sauce",
    category: new ObjectId("676f0de0bc7253f48c1aff95"),
    available: true,
  },
  {
    name: "Arroz Blanco",
    description: "Arroz blanco al estilo japonés.",
    price: 1.99,
    image: "https://source.unsplash.com/featured/?rice,japanese",
    category: new ObjectId("676f0de0bc7253f48c1aff95"),
    available: true,
  },
  {
    name: "Togarashi",
    description: "Mezcla de especias japonesas para condimentar.",
    price: 1.49,
    image: "https://source.unsplash.com/featured/?togarashi,spice",
    category: new ObjectId("676f0de0bc7253f48c1aff95"),
    available: true,
  },
];

async function loadProducts() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db();
    const collection = database.collection("products");

    const result = await collection.insertMany(products, { ordered: true });
  } catch (error) {
    console.error("Error cargando los productos:", error);
  } finally {
    await client.close();
  }
}

loadProducts();
