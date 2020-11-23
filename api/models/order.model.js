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
                id_category: String,
                name: String,
                price: Number,
                id_brand: String,
                img: String,
                description: String,
                count: Number,
                _id: String
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
        //$dateToString: { format: "%Y-%m-%d", date: "$date" }
        default: Date.now
    },
    city:{
        type: String,
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
    name:{
        type: String,
        required:[true,"Không được bỏ trống"]
    },
    address:{
        type: String,
        required:[true,"Không được bỏ trống"]
    },
    email: {
        type: String,
        required: [true, "Không được bỏ trống"],
        index: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    is_send: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('order', order);