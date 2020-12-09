'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart = new Schema ({
    id_user: {
        type: String,
    },
    products: {
        type: [
            {
                name: String,
                price: Number,
                img: String,
                count: Number,
                _id: String
            }
        ],
        required : true,
        minlength: 1,
    },
    grandTotal: {
        type: Number
    },
    status:{
        type:Boolean
    },
    date_cart: {
        type: Date,
        default: Date.now()
    }

});

cart.methods.updateCountProduct = async function() {
    const cart = this;
    for (let i = 0; i < cart.products.length; i++) {
        let index = cart.products.findIndex(
          element => cart.products[i]._id === element._id
        );
        if(index !== -1)
        {
            cart.grandTotal = cart.products[index].price * cart.products[index].count
        }
    }
}

module.exports = mongoose.model('cart', cart);