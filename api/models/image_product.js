const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const imageProduct = new mongoose.Schema({
    images: {
        type: Array,
        default:[]
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'product'
    }
});

module.exports = mongoose.model('image_product', imageProduct)