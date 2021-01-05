const mongoose = require("mongoose");
sizeProductSchema = require("../models/size_product").schema;

const Schema = mongoose.Schema;
const colorProductSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String,
        unique: true
    },
    sizeProducts:[sizeProductSchema],
    product: {
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    }
},{timestamps: true});

module.exports = mongoose.model('ColorProduct',colorProductSchema);