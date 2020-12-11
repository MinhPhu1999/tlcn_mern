const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const order=new Schema({
    id_user:{
        type:String
    },
    cart:{
        type:[
            {
                name:String,
                price:Number,
                id_category:String,
                image:String,
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
    shipping_address:{
        type:[
            {
                city:String,
                country:String,
                posteCode:Number,
                number:String,
                phone:String,
                address:String
            }
            
        ],
        required:true,
    },
    // status:{
    //     type:Boolean
    // }
});

module.exports = mongoose.model('bill', order);