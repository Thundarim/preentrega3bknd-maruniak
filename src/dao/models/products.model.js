const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  title:{
  type: String,
  required: true
},
  description:{
    type: String,
    required: true
  },
  img:{type:String
  },
  
  price: {
    type:Number,
  required:true
},
  thumbnail: {
    type:String
  },
  code:{
    type: String,
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    required: true
  },
  status: { type:Boolean,
    required:true
  },
  category: { type:String,
    required:true
  },
});
productSchema.plugin(mongoosePaginate);

const Product = mongoose.model( "Product", productSchema);
module.exports = Product;
