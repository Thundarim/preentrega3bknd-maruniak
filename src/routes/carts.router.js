const express = require('express');
const CartManager = require('../controller/cartManager.js');
const Product = require('../dao/models/products.model.js');
const router = express.Router();
const Cart = require('../dao/models/cart.model.js');
const cartManager = new CartManager();
const nodemailer = require('nodemailer');
const configObject  = require('../config/config.js');
const {nodemail, nodepass} = configObject;
const Ticket = require ('../dao/models/ticket.model.js');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: nodemail,
        pass: nodepass
    }
});

async function generateTicket(products) {
    if (!products || products.length === 0) {
        return "No hay productos en el carrito";
    }

    let totalPrice = 0;
    let ticket = "Ticket de compra:\n\n";

    for (const item of products) {
        const product = item.product;
        const quantity = item.quantity;
        const subtotal = product.price * quantity;

        totalPrice += subtotal;
        ticket += `Producto: ${product.title}\n`;
        ticket += `Precio unitario: ${product.price} USD\n`;
        ticket += `Cantidad: ${quantity}\n`;
        ticket += `Subtotal: ${subtotal} USD\n\n`;
    }

    ticket += `Total: ${totalPrice} USD\n`;

    return ticket;
}



router.post("/carts", async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        console.error("Error al crear un nuevo carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Obtener todos los carritos
router.get("/carts", async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        console.error("Error al obtener carritos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


// Obtener los carritos por id
router.get("/carts/:cid", async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        const products = await cartManager.getProductsInCart(cartId);
        res.render("cartid", { cart: cart.toObject(), products: products });
    } catch (error) {
        console.error("Error al obtener carrito por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// Añadir producto al carrito
router.post("/carts/product/:pid", async (req, res) => {
    if (!req.session.cart) {
        res.status(400).json({ error: "Carrito no encontrado en la sesion" });
        return;
    }

    const cartId = req.session.cart._id;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;
  
    try {
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al agregar producto al carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// Eliminar producto del carrito
router.delete("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
  
    try {
        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al eliminar producto del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Actualizar carrito con arreglo de productos
router.put("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const products = req.body.products;
  
    try {
        const updatedCart = await cartManager.updateCartProducts(cartId, products);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al actualizar productos del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Actualizar cantidad de ejemplares del producto en el carrito
router.put("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity;
  
    try {
        const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al actualizar cantidad del producto en el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Eliminar todos los productos del carrito
router.delete("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
  
    try {
        const updatedCart = await cartManager.removeAllProductsFromCart(cartId);
        res.json(updatedCart.products);
    } catch (error) {
        console.error("Error al eliminar todos los productos del carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// Comprar productos

// Funcion para el ticket unico
function generateUniqueTicketCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Funcion para el monto total
function calculateTotalAmount(productsInCart) {
    let totalAmount = 0;
    for (const item of productsInCart) {
        const product = item.product;
        const quantity = item.quantity;
        const subtotal = product.price * quantity;
        totalAmount += subtotal;
    }
    return totalAmount;
}


router.post("/carts/:cid/purchase", async (req, res) => {
    const userEmail = req.session.user.email;

    try {
        const productsInCart = await cartManager.getProductsInCart(req.params.cid);
        if (!productsInCart || productsInCart.length === 0) {
            console.log(`El carrito con ID ${req.params.cid} está vacío. Agrega productos antes de proceder con la compra.`);
            throw new Error("El carrito está vacío. Agrega productos antes de proceder con la compra.");
        }
        const productsToUpdate = [];

        for (const item of productsInCart) {
            const product = item.product;
            const quantity = item.quantity;
            if (product.stock >= quantity) {
                productsToUpdate.push({ product: product._id, quantity });
            } else {
                throw new Error(`No hay suficiente stock para el producto ${product.title}`);
            }
        }
        for (const productToUpdate of productsToUpdate) {
            await Product.findByIdAndUpdate(productToUpdate.product, {
                $inc: { stock: -productToUpdate.quantity }
            });
        }
        const ticket = await generateTicket(productsInCart);
        const newTicket = new Ticket({
            code: generateUniqueTicketCode(),
            amount: calculateTotalAmount(productsInCart),
            purchaser: userEmail,
            ticketInfo: ticket
        });
        await newTicket.save();

        const mailOptions = {
            from: 'your_email@gmail.com',
            to: userEmail,
            subject: 'Compra finalizada',
            text: `Gracias por su compra. Aquí está su ticket de compra:\n\n${ticket}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
            } else {
                console.log('Correo enviado:', info.response);
            }
        });
        req.session.cart = null;
        res.redirect("/profile");

    } catch (error) {
        console.error("Error al finalizar la compra:", error);
        res.status(400).json({ error: error.message, showAlert: true });
    }
});





router.post('/carts/add', async (req, res) => {
    try {
      const productId = req.body.productId;
      const userId = req.session.user._id;
      let cart = await Cart.findOne({ userId });
  
      if (!cart) {
        cart = new Cart({ userId, products: [productId] });
      } else {
        cart.products.push(productId);
      }
      
      await cart.save();
  
      res.status(200).json({ message: 'Producto añadido al carrito' });
    } catch (error) {
      console.error('Error al añadir producto:', error);
      res.status(500).json({ error: 'error interno del servidor' });
    }
  });

module.exports = router;
