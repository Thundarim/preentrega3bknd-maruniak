const Product = require("../dao/models/products.model");


class ProductManager {
    static ultId = 0;

    constructor(path) {
        this.products = [];
        this.path = path;
        this.removedProductId = null;
    }
    async getProducts() {
        try {
            const products = await Product.find();
            return products;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async getProductById(id) {
        try {
            const product = await Product.findById(id);
            return product;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async addProduct(newProduct) {
        try {
            if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || !newProduct.stock || !newProduct.category) {
                throw new Error("Todos los campos son obligatorios");
            }
    
            const ultId = await Product.countDocuments() + 1;
            newProduct.id = ultId;
            newProduct.status = true;
    
            const addedProduct = await Product.create(newProduct);
            return addedProduct;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async updateProduct(productId, updatedFields) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, { new: true });
            return updatedProduct;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    async deleteProduct(identifier) {
        try {
            const isId = !isNaN(identifier);
            
            if (isId || (typeof identifier === 'string' && identifier.trim() !== '')) {
                const deletedProduct = isId
                    ? await Product.findOneAndDelete({ id: parseInt(identifier) })
                    : await Product.findOneAndDelete({ code: identifier });
    
                if (deletedProduct) {
                    this.removedProductId = isId ? parseInt(identifier) : null;
                    return true;
                } else {
                    return false;
                }
            } else {
                console.error('ID o codigo invalido:', identifier);
                return false;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    
    
    getRemovedProductId() {
        return this.removedProductId;
    }
}
module.exports = ProductManager;
