const express = require("express");
const router = express.Router();
const Product = require("../dao/models/products.model.js");

// añadir un nuevo producto
router.post("/products", async (req, res) => {
    try {
        const newProductData = req.body;
        const newProduct = await Product.create(newProductData);
        console.log("Producto agregado correctamente");
        res.json({ message: "Producto agregado correctamente" });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});



// Obtener productos
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 10, order = 'asc', title } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { price: order === 'desc' ? -1 : 1 }
        };

        let query = {};
        if (title) {
            query = { title: { $regex: new RegExp(title, "i") } };
        }

        const products = await Product.paginate(query, options);

        const totalPages = products.totalPages;

        res.json({
            products: products.docs,
            currentPage: parseInt(page),
            totalPages: totalPages,
            hasPrevPage: products.hasPrevPage, 
            hasNextPage: products.hasNextPage,
            prevPage: products.hasPrevPage ? parseInt(page) - 1 : null,
            nextPage: products.hasNextPage ? parseInt(page) + 1 : null
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor, vamos a morir" });
    }
});




// obtener productos por id
router.get("/products/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findOne({ _id: productId });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al obtener producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// actualizar producto por id
router.put("/products/:pid", async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedProductData = req.body;
        const updatedProduct = await Product.findOneAndUpdate({ _id: productId }, updatedProductData, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al actualizar producto por ID:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// borrar producto por id
router.delete("/products/:idOrCode", async (req, res) => {
    try {
        const idOrCode = req.params.idOrCode;
        if (!idOrCode) {
            return res.status(400).json({ error: "Id invalido o codigo" });
        }

        let deletedProduct;
        deletedProduct = await Product.findOneAndDelete({ _id: idOrCode });
        if (!deletedProduct) {
            deletedProduct = await Product.findOneAndDelete({ code: idOrCode });
        }

        if (deletedProduct) {
            return res.json({ success: true, message: "Producto eliminado correctamente" });
        } else {
            return res.status(404).json({ success: false, error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error("Error al eliminar producto por ID o código:", error);
        return res.status(500).json({ success: false, error: "Error interno del servidor" });
    }
});




module.exports = router;
