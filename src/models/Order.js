const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number },
    customerName: { type: String, required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      enum: [
        "pendiente",
        "rechazada",
        "aceptada",
        "cancelada",
        "en proceso",
        "en camino",
        "entregada",
      ],
      default: "pendiente",
    },
    deliveryType: {
      type: String,
      enum: ["delivery", "pickup"],
      required: true,
    },
    deliveryAddress: {
      type: String,
    },
    scheduledTime: {
      type: String,
    },
    comments: {
      type: String,
      maxLength: 500,
      default: "",
    },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

orderSchema.plugin(AutoIncrement, { inc_field: "orderNumber" });

module.exports = mongoose.model("Order", orderSchema);
