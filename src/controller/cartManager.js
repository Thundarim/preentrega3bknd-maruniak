const Cart = require("../dao/models/cart.model.js")
const Product = require("../dao/models/products.model.js");
const ProductManager = require('./productManager.js');

class CartManager {
  constructor(productManager) {
    this.productManager = productManager;
  }
  async getCarts() {
    try {
      const carts = await Cart.find();
      return carts;
    } catch (error) {
      console.log("Error al obtener los carritos:", error);
      throw error;
    }
  }
  async getCartById(cartId) {
    try {
      const cart = await Cart.findById(cartId).exec();
      if (!cart) {
        console.log("No existe ese carrito con el ID especificado.");
        return null;
      }
      return cart;
    } catch (error) {
      console.log("Error al obtener el carrito por ID:", error);
      throw error;
    }
  }
  
  async getProductsInCart(cartId) {
    try {
        const cart = await Cart.findById(cartId).populate('products.product', 'title price stock');
        if (!cart) {
            throw new Error(`No existe ese carrito con el ID especificado: ${cartId}`);
        }
        return cart.products;
    } catch (error) {
        console.log(`Error al obtener los productos del carrito ${cartId}:`, error);
        throw error;
    }
}


async removeProductFromCart(cartId, productId) {
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      throw new Error(`No existe ese carrito con el ID especificado: ${cartId}`);
    }
    const updatedProducts = cart.products.filter(item => item.product.toString() !== productId);
    cart.products = updatedProducts;
    await cart.save();
    
    console.log(`Producto ${productId} eliminado del carrito ${cartId}. Nuevo estado del carrito:`, cart);
    
    return cart;
  } catch (error) {
    console.log(`Error al eliminar el producto ${productId} del carrito ${cartId}:`, error);
    throw error;
  }
}





  async removeAllProductsFromCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`No existe ese carrito con el ID especificado: ${cartId}`);
      }

      cart.products = [];
      

      await cart.save();
      

      return cart;
    } catch (error) {
      console.log(`Error al eliminar todos los productos del carrito ${cartId}:`, error);
      throw error;
    }
  }
async addProductToCart(cartId, productId, quantity) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Producto con la id ${productId} no se ha encontrado`);
    }

    const existingCartItem = await Cart.findOne({
      _id: cartId,
      'products.product': productId,
    });

    if (existingCartItem) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          _id: cartId,
          'products.product': productId,
        },
        {
          $inc: {
            'products.$.quantity': quantity,
          },
        },
        { new: true }
      ).populate('products.product', 'title');
      return updatedCart;
    } else {
      const updatedCart = await Cart.findOneAndUpdate(
        { _id: cartId },
        {
          $push: {
            products: {
              product: productId,
              quantity,
            },
          },
        },
        { new: true }
      ).populate('products.product', 'title');
      return updatedCart;
    }
  } catch (error) {
    throw new Error(`Error al agregar producto al carrito: ${error.message}`);
  }
}
  async createCart() {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        return newCart;
    } catch (error) {
        console.error("Error al crear el nuevo carrito de compras:", error);
        throw error;
    }
}
}


module.exports = CartManager;
