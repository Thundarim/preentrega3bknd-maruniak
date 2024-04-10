const express = require("express");
const router = express.Router();
const passport = require("passport");
const CartManager = require('../controller/cartManager.js');
const Product = require('../dao/models/products.model.js'); 

const cartManager = new CartManager();

const isAuthenticated = (req, res, next) => {
    if (req.session.login) {
        next();
    } else {
        res.redirect("/login");
    }
};
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === "admin") {
        next();
    } else {
        res.status(403).send("Forbidden");
    }
};



router.get('/current', async (req, res) => {
    try {
        if (req.session && req.session.user) {
            if (!req.session.cart) {
                const newCart = await cartManager.createCart();
                req.session.cart = newCart;
            }
            const cartId = req.session.cart._id;
            const cartWithProducts = await cartManager.getProductsInCart(cartId);
            const productIds = cartWithProducts.map(product => product.product._id);
            const populatedProducts = await Product.find({ _id: { $in: productIds } }).select('stock');
            cartWithProducts.forEach((product, index) => {
                const matchedProduct = populatedProducts.find(populatedProduct => populatedProduct._id.equals(product.product._id));
                if (matchedProduct) {
                    product.stock = matchedProduct.stock;
                }
            });
            
            res.json({ user: req.session.user, cart: cartWithProducts });
        } else {
            res.status(401).json({ error: "No hay usuario autenticado" });
        }
    } catch (error) {
        console.error("Error al obtener el usuario y el carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});






router.get("/logout", async (req, res) => {
    try {
        delete req.session.cart;
        req.session.destroy((err) => {
            if (err) {
                console.error("Error al cerrar la sesión:", err);
                res.status(500).json({ error: "Error interno del servidor al cerrar la sesión" });
            } else {
                res.redirect("/login");
            }
        });
    } catch (error) {
        console.error("Error al cerrar la sesión:", error);
        res.status(500).json({ error: "Error interno del servidor al cerrar la sesión" });
    }
});


router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
router.get("/githubcallback", passport.authenticate("github", { failureRedirect: "/login" }), async (req, res) => {
    try {
        if (req.user) {
            req.session.user = req.user;
            req.session.login = true;
            res.redirect("/profile");
        } else {
            res.status(401).send("Unauthorized");
        }
    } catch (error) {
        console.error("Error in GitHub authentication callback:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/login", async (req, res, next) => {
    passport.authenticate("login", {failureRedirect: "/api/sessions/faillogin"}, async (err, user, info) => {
        if (err) {
            return res.status(500).json({ status: "error", message: "Error de autenticación" });
        }
        if (!user) {
            return res.status(400).json({ status: "error", message: "Credenciales inválidas" });
        }
        try {
            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                age: user.age,
                email: user.email,
                role: user.role,
                cartId: user.cartId
            };

            req.session.login = true;

            res.redirect("/products");
        } catch (error) {
            console.error("Error al crear un nuevo carrito:", error);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    })(req, res, next);
});


router.get("/faillogin", async (req, res ) => {
    console.log("Fallo la estrategia")
    res.send({error: "fallo nose porque, vos sabes?"});
});

router.get("/realtimeproducts", isAuthenticated, isAdmin, (req, res) => {
});

router.get("/", async (req, res) => {
    try {
        if (!req.session.cart) {
            const newCart = await cartManager.createCart();
            req.session.cart = newCart;
        }
        const cart = req.session.cart;
        const productList = await getProductList();
        res.json({ products: productList, cart: cart });
    } catch (error) {
        console.error("Error al obtener la lista de productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.get("/cart", (req, res) => {
    if (req.session.user.role === 'admin') {
        res.redirect("/carts");
    } else {
        const cartId = req.session.cart._id;
        res.redirect(`/api/carts/${cartId}`);
    }
});


module.exports = router;
