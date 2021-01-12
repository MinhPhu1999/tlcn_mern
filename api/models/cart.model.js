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
                size: String,
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
    const productfind = await product.findOne({ _id: cart.products[index]._id, "size.type": cart.products[index].size });
    let index1;
    for(let i =0; i< productfind.size.length; i++){
        if(productfind.size[i].type === cart.products[index].size){
            index1 = i;
        }
    }
    let quantity = productfind.size[index1].quantity;
    quantity -= 1;
    product.updateOne(
		{ _id: cart.products[index]._id, "size.type": cart.products[index].size },
		{
		  $set: {
			"size.$": [
			  {type:cart.products[index].size, quantity: quantity },
			],
		  },
		}
	).exec((error, product) => {
		if (error) 
			return res.status(400).send({ error });
    });
    
}


cart.methods.plusProduct = async function(){
    const cart = this;
    let index;
    for (let i = 0; i < cart.products.length; i++) {
        index = cart.products.findIndex(
          element => cart.products[i]._id === element._id
        );
    }
    const productfind = await product.findOne({ _id: cart.products[index]._id, "size.type": cart.products[index].size });
    let index1;
    for(let i =0; i< productfind.size.length; i++){
        if(productfind.size[i].type === cart.products[index].size){
            index1 = i;
        }
    }
    let quantity = productfind.size[index1].quantity;
    quantity += 1;
    product.updateOne(
		{ _id: cart.products[index]._id, "size.type": cart.products[index].size },
		{
		  $set: {
			"size.$": [
			  {type:cart.products[index].size, quantity: quantity },
			],
		  },
		}
	).exec((error, product) => {
		if (error) 
			return res.status(400).send({ error });
    });

}

module.exports = mongoose.model('cart', cart);