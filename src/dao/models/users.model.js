const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String, 
        required: true
    },
    last_name : {
        type: String
    },
    email : {
        type: String, 
        required: true,
        index: true, 
        unique: true
    }, 
    password: {
        type: String, 
        required: true
    },
    age : {
        type: Number
    },
    role: {
        type: String,
        enum: ["usuario", "admin"],
        default: "usuario"
    },
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cartCollection'
    }
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
