const mongoose = require('mongoose');
const cartCollection = "carts";

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
});
cartSchema.pre('findOne', function (next) {
  this.populate('products.product', '_id title price stock');
  next();
});



const Cart = mongoose.model(cartCollection, cartSchema);

module.exports = Cart;
