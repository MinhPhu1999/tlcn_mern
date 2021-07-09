const mongoose = require('mongoose');
const product = require('../models/product.model');
const Schema = mongoose.Schema;

const cart = new Schema({
    id_user: {
        type: String,
    },
    products: {
        type: [
            {
                name: String,
                price: Number,
                img: String,
                quantity: Number,
                id: String,
                color: { type: Schema.Types.ObjectId, ref: 'color' },
                size: { type: Schema.Types.ObjectId, ref: 'size' },
            },
        ],
        required: true,
        minlength: 1,
    },
    grandTotal: {
        type: Number,
    },
    status: {
        type: Boolean,
        default: true,
    },
    date_cart: {
        type: Date,
        default: Date.now(),
    },
});

cart.methods.updateCountProduct = async function () {
    const cart = this;
    let index;
    for (let i = 0; i < cart.products.length; i++) {
        index = cart.products.findIndex(element => cart.products[i]._id === element._id);
        if (index !== -1) {
            cart.grandTotal = cart.products[index].price * cart.products[index].quantity;
        }
    }
};

cart.methods.minusQuantity = async function (id_size, res) {
    const cart = this;
};

cart.methods.plusProduct = async function (id_product) {
    let productFind = await product.findById(id_product);
    productFind.quantity += 1;

    try {
        await productFind.save();
    } catch (err) {
        console.log(err);
        return;
    }
};

module.exports = mongoose.model('cart', cart);
