const mongoose = require('mongoose');
const product = require('../models/product.model');
const Schema = mongoose.Schema;

const cart = new Schema ({
    id_user: {
        type: String,
    },
    products: {
        type: [
            {
                name: String,
                price: Number,
                img: String,
                quantity: Number,
                _id: String
            }
        ],
        required : true,
        minlength: 1,
    },
    grandTotal: {
        type: Number
    },
    status:{
        type:Boolean
    },
    date_cart: {
        type: Date,
        default: Date.now()
    }

},{timestamps: true});

cart.methods.updateCountProduct = async function() {
    const cart = this;
    let index;
    for (let i = 0; i < cart.products.length; i++) {
        index = cart.products.findIndex(
          element => cart.products[i]._id === element._id
        );
        if(index !== -1)
        {
            cart.grandTotal = cart.products[index].price * cart.products[index].quantity;
        }
    }

    //let productFind = await product.findById(cart.products[index]._id);

}
cart.methods.minusProduct = async function(req, res){
    const cart = this;
    let index;
    for (let i = 0; i < cart.products.length; i++) {
        index = cart.products.findIndex(
          element => cart.products[i]._id === element._id
        );
    }
    let productFind = await product.findById(cart.products[index]._id);
    if(productFind.quantity <=0)
    {
        return res.status(500).send("Sản phẩm đã hết");
    }
    productFind.quantity -= 1;
    try{
        await productFind.save();
    }
    catch(err){
        console.log(err);
        return;
    }    
}


cart.methods.plusProduct = async function(){
    const cart = this;
    let index;
    for (let i = 0; i < cart.products.length; i++) {
        index = cart.products.findIndex(
          element => cart.products[i]._id === element._id
        );
    }

    let productFind = await product.findById(cart.products[index]._id);
    productFind.quantity += 1;
    try{
        await productFind.save();
    }
    catch(err){
        console.log(err);
        return;
    } 

}

module.exports = mongoose.model('cart', cart);