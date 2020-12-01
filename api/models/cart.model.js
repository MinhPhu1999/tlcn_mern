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
                id_category: String,
                name: String,
                color: String,
                size: String,
                price: Number,
                id_brand: String,
                img: String,
                description: String,
                count: Number,
                _id: String
            }
        ],
        required : true,
        minlength: 1,
    },
    status:{
        type:Boolean
    }
});

module.exports = mongoose.model('cart', cart);