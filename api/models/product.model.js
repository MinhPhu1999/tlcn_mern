'use strict'
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const product = new Schema({
    name:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    price:{
        type:Number,
        required:[true,"Không được bỏ trống"],
    },
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
    rating:{
        type:Number
    },
    numReviews:{
        type:Number
    },
    countInStock:{
        type:Number
    },
    status:{
        type:Boolean
    }
});

module.exports = mongoose.model('product', product);