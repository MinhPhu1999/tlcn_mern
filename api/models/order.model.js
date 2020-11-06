'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order=new Schema({
    id_user:{
        type:String
    },
    cart:{
        type:[
            {
                _id:String,
                name:String,
                price:Number,
                id_category:String,
                img:String,
                id_brand:String,
                count:Number
            }
        ],
        required:true,
    },
    order_status:{
        type:Boolean,
        required:true
    },
    order_subtotal:{
        type:Number,
        required:true
    },
    order_date:{
        type: Date,
        $dateToString: { format: "%Y-%m-%d", date: "$date" },
        default: new Date()
    },
    city:{
        type: String,
        required:[true,"Không được bỏ trống"]
    },
    country:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    posteCode:{
        type: Number,
        required:[true,"Không được bỏ trống"]
    },
    phone:{
        type:String,
        required:[true,"Không được bỏ trống"]
    },
    address:{
        type: String,
        required:[true,"Không được bỏ trống"]
    },
    email:{
        type: String,
        required:[true,"Không được bỏ trống"]
    },
    // status:{
    //     type:Boolean
    // }
});

module.exports = mongoose.model('order', order);