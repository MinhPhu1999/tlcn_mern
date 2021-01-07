const mongoose = require('mongoose');
const Schema = mongoose.Schema;
colorProductSchema = require("../models/color_product").schema;

const product = new Schema({
    name:{
        type:String,
        //required:[true,"Không được bỏ trống"]
    },
    price:{
        type:Number,
        //required:[true,"Không được bỏ trống"],
    },
    id_category:{
        type:String,
        // required:[true,"Không được bỏ trống"],
        // index:true
    },
    img:{
        type:String,
        //required:[true,"Không được bỏ trống"]
    },
    detailImage: {
        type: Array,
        default: []
    },
    id_brand:{
        type:String,
        // required:[true,"Không được bỏ trống"],
        // index:true
    },
    description:{
        type:String,
        //required:[true,"Không  được bỏ trống"]
    },
    color: {
        type: String
    },
    size: [
        {
          type: {
            type: String,
            //enum: ["S", "M", "L", "XL", "2XL"]
          },
          quantity: {
            type: Number
          },
        },
    ],
    rating:{
        type:Number
    },
    numReviews:{
        type:Number
    },
    status:{
        type:Boolean,
        default: true
    }
},{timestamps: true});

module.exports = mongoose.model('product', product);