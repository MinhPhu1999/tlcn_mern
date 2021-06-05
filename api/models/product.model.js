const mongoose = require('mongoose');
const Schema = mongoose.Schema;
sizeProductSchema = require('../models/size_product').schema;
colorProductSchema = require('../models/color_product').schema;

const product = new Schema({
    name: {
        type: String,
        required: [true, 'Không được bỏ trống'],
    },
    price: {
        type: Number,
        required: [true, 'Không được bỏ trống'],
    },
    sellPrice: Number,
    id_category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
    },
    quantity: {
        type: Number,
        require: true,
    },
    images: {
        type: Array,
        default: [],
    },
    id_brand: {
        type: Schema.Types.ObjectId,
        ref: 'brand',
    },
    description: {
        type: String,
        required: [true, 'Không  được bỏ trống'],
    },
    colorProducts: {
        type: Schema.Types.ObjectId,
        ref: 'colorproduct',
    },
    sizeProducts: {
        type: Schema.Types.ObjectId,
        ref: 'sizeproduct',
    },
    numReviews: Number,
    rating: Number,
    status: {
        type: Boolean,
        default: true,
    },
});

module.exports = mongoose.model('product', product);
