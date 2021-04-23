const mongoose = require('mongoose');
const Schema = mongoose.Schema;
colorProductSchema = require("../models/color_product").schema;

const product = new Schema({
    name:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    price:{
        type:Number,
        required:[true,"Không được bỏ trống"],
    },
    disCount: {
        type: Number,
        default: 0
    },
    startDate: Date,
    endDate: Date,
    id_category:{
        type:String,
        required:[true,"Không được bỏ trống"],
        index:true
    },
    img:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    id_brand:{
        type:String,
        required:[true,"Không được bỏ trống"],
        index:true
    },
    description:{
        type:String,
        required:[true,"Không  được bỏ trống"]
    },
    color: {
        type: String
    },
    quantity: {
        type: Number
    },
    numReviews: Number,
    rating: Number,
    status:{
        type:Boolean,
        default: true
    }
},{timestamps: true});

module.exports = mongoose.model('product', product);