const express = require("express");
const router = express.Router();
const ProductManager = require("../controller/productManager.js");
const productManager = new ProductManager("./src/models/products.json");
const CartManager = require('../controller/cartManager.js');
const cartManager = new CartManager();

function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}


const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        next();
    } else {
        res.status(403).send("NO PASAS");
    }
};

const isUser = (req, res, next) => {
    if (req.session.user && req.session.user.role === "usuario") {
        next();
    } else {
        res.status(403).send("NO PASAS");
    }
};



router.get("/", async (req, res) => {
    try {
        const cartId = req.session.cartId;
        res.render("index", { loggedIn: res.locals.loggedIn, isAdmin: res.locals.isAdmin, cartId: cartId, });
    } catch (error) {
        console.error('Error al cargar la ruta raiz:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get("/home", isLoggedIn, async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
router.get("/realtimeproducts", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render("realtimeproducts", { products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.delete("/products/:pid", isLoggedIn, isAdmin, async (req, res) => {
    try {
        const productId = parseInt(req.params.pid);
        const deletedProduct = await productManager.deleteProduct(productId);
        if (deletedProduct) {
            io.emit('realtimeProductRemoval', productId);
            res.json({ message: "Producto eliminado correctamente" });
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/cart", isLoggedIn, (req, res) => {
    const cartId = req.session.cart._id;
    if (req.session.user.role === 'admin') {
        cartManager.getCarts()
            .then(carts => {
                res.render("cart", { carts: carts });
            })
            .catch(error => {
                console.error("Error al hacer fetch a los carritos:", error);
                res.status(500).json({ error: "Error interno del servidor" });
            });
    } else {

        const cartId = req.session.cart._id;
        cartManager.getCartById(cartId)
            .then(cart => {
                res.render("cart", { carts: [cart] });
            })
            .catch(error => {
                console.error("Error fetching user's cart:", error);
                res.status(500).json({ error: "Error interno del servidor" });
            });
    }
});

router.get("/chat", isLoggedIn, isUser, (req, res) => {
    res.render("chat", { user: req.session.user })   ;
});

router.get("/products", isLoggedIn, isUser, (req, res) => {
    res.render("products", { user: req.session.user })   ;
});
router.get('/carts/:cid', isLoggedIn, async (req, res) => {
    try {
        const cartId = req.params.cid;
        const selectedCart = await cartManager.getCartById(cartId);

        if (!selectedCart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const productsInCart = selectedCart.products.map(item => ({
            product: item.product.toObject(),
            quantity: item.quantity
        }));

        res.render('cartid', { products: productsInCart });
    } catch (error) {
        console.error("Error al obtener productos en el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get("/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }

    res.render("profile", { user: req.session.user });
});


module.exports = router;
