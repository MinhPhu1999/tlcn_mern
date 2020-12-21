const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order=new Schema({
    id_user:{
        type:String
    },
    cart:{
        type:[
            {
                name: String,
                price: Number,
                img: String,
                count: Number,
                total: Number,
                _id: String
            }
        ],
        required:true,
    },
    order_status:{
        type:String,
        required:true
    },
    order_subtotal:{
        type:Number,
        required:true
    },
    order_date:{
        type: Date,
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
    shiping: {
        type: Number
    },
    is_send: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('order', order);