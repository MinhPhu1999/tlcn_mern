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
                total: Number,
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
    }
});

module.exports = mongoose.model('cart', cart);