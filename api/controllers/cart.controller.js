"use strict";
const cart = require("../models/cart.model");
const product = require('../models/product.model');
exports.addToCart = async (req, res) => {
  if (typeof req.body.id_user === 'undefined'
    || typeof req.body.products === 'undefined') {
      res.status(422).send({message: "invalid data" });
    return;
  }
  const { id_user, products} = req.body;
  let cartFind = null;
  cartFind = await cart.findOne({ id_user: id_user });
  if (cartFind === null) {
    const cart_new = new cart({
      id_user: id_user,
      products: products,
      status: true
    });
    try {
      await cart_new.save()
                    .then(cart_new.updateCountProduct());
    } catch (err) {
      res.status(500).send({message: err });
      return;
    }
  }
  else{
    for (let i = 0; i < products.length; i++) {
      let index = cartFind.products.findIndex(
        element => products[i]._id === element._id
      );
      if (index === -1) {
        cartFind.products.push(products[i]);
        cartFind.grandTotal += (cartFind.products[cartFind.products.length - 1].price * cartFind.products[cartFind.products.length - 1].count);
      }
    }    
    try {
      await cart.findByIdAndUpdate(cartFind._id, {
        $set: { products: cartFind.products,
                grandTotal: cartFind.grandTotal}
      });
    } catch (err) {
      res.status(500).send({message: err });
      return;
    }
  }
  res.status(200).send({message: "add cart success" });
}

exports.getCart = async (req,res)=>{
  const id_user = req.params.id_user;
  const cartFind = await cart.findOne({id_user: id_user});
  if(cartFind){
      res.status(200).send(cartFind.products);
      return;
  }
  res.status(404).send({message: "product not found"});
}

exports.getAll = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(422).send({message: "invalid data" });
    return;
  }
  cart.findOne({ id_user: req.params.id_user, status: true }, (err, docs) => {
    if (err) {
      res.status(500).send({message: err });
      return;
    }
    res.status(200).send({ data: docs });
  });
}

exports.updateTang = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  const { id_user, id_product} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).send({message: "product not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => id_product === element._id
  );
  cartFind.products[index].count += 1;
  cartFind.grandTotal += cartFind.products[index].price;
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products,
              grandTotal: cartFind.grandTotal }
    });
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  res.status(200).send({message: "update cart success" });
};

exports.updateGiam = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  const { id_user, id_product} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).send({message: "product not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => id_product === element._id
  );
  cartFind.products[index].count -= 1;
  cartFind.grandTotal -= cartFind.products[index].price;
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products,
              grandTotal: cartFind.grandTotal }
    });
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  res.status(200).send({message: "update cart success" });
};

exports.updateCart = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.products === "undefined" ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  const { id_user, products} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).send({message: "product not found" });
    return;
  }
  let i, index;
  const productLen = products.length;
  for (i = 0; i < productLen; i++) {
    index = cartFind.products.findIndex(
      element => products[i]._id === element._id
    );
    if (index === -1) {
      res.status(404).send({message: "product not found in list" });
    } else {
      // cartFind.products[index].count = Number(products[i].count);
      cartFind.products[index].count += 1;
    }
  }
  
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products }
    });
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  res.status(200).send({message: "update cart success" });
};

exports.deleteCart = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(422).send({message: "invalid data" });
    return;
  }
  const { id_user } = req.params;

  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).send({message: "cart not found" });
    return;
  }
  //cartFind.status = false;
  try {
    await cartFind.remove();
  }
  catch (err) {
      res.status(500).send({message: err });
      return;
  }

  res.status(200).send({message: "delete cart success" });
}

exports.deleteProductInCart = async (req, res) => {
  // if (
  //   typeof req.body.id_user === "undefined" ||
  //   typeof req.body.id_product === "undefined"
  // ) {
  //   res.status(422).send({message: "invalid data" });
  //   return;
  // }
  const { id_user, id_product } = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).send({message: "not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => element._id === id_product
  );
  if (index === -1) {
    res.status(404).send({message: "product not found in list" });
    return;
  }
  cartFind.grandTotal -= (cartFind.products[index].count * cartFind.products[index].price )
  cartFind.products.splice(index, 1);

  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products,
              grandTotal: cartFind.grandTotal }
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({message: err });
    return;
  }
  res.status(200).send({message: "delete success" });
};