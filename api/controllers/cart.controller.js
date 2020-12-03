"use strict";
const cart = require("../models/cart.model");
const product = require('../models/product.model');
exports.addToCart = async (req, res) => {
  if (typeof req.body.id_user === 'undefined'
    || typeof req.body.products === 'undefined') {
      res.status(422).json({ msg: "invalid data" });
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
      await cart_new.save();
    } catch (err) {
      res.status(500).json({ msg: err });
      return;
    }
  }else{
    let i, index;
    const productLen = products.length;
    for (i = 0; i < productLen; i++) {
      index = cartFind.products.findIndex(
        element => products[i]._id === element._id
      );
      
      if (index === -1) {
        cartFind.products.push(products[i]);
      } else {
        cartFind.products[index].count += Number(products[i].count);
      }
    }
  
    try {
      await cart.findByIdAndUpdate(cartFind._id, {
        $set: { products: cartFind.products }
      });
    } catch (err) {
      res.status(500).json({ msg: err });
      return;
    }
  }
  res.status(200).json({ msg: "add cart success" });
}

exports.getCart = async (req,res)=>{
  cart.find({status:true},(err,docs)=>{
    if(err){
        res.status(422).json({msg:err});
        return;
    }
    res.status(200).json({data:docs});
})
}

exports.getAll = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  cart.findOne({ id_user: req.params.id_user, status: true }, (err, docs) => {
    if (err) {
      res.status(500).json({ msg: err });
      return;
    }
    res.status(200).json({ data: docs });
  });
}

exports.update = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, id_product} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "product not found" });
    return;
  }
  let i, index;
  index = cartFind.products.findIndex(
    element => id_product === element._id
  );
  cartFind.products[index].count +=1;
  
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products }
    });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "update cart success" });
};

exports.updateCart = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.products === "undefined" ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, products} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "product not found" });
    return;
  }
  let i, index;
  const productLen = products.length;
  for (i = 0; i < productLen; i++) {
    index = cartFind.products.findIndex(
      element => products[i]._id === element._id
    );
    if (index === -1) {
      res.status(404).json({ msg: "product not found in list" });
    } else {
      cartFind.products[index].count = Number(products[i].count);
    }
  }
  
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products }
    });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "update cart success" });
};

exports.deleteCart = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user } = req.params;

  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "cart not found" });
    return;
  }
  cartFind.status = false;
  try {
    await cartFind.save();
  }
  catch (err) {
      res.status(500).json({ msg: err });
      return;
  }

  res.status(200).json({ msg: "delete cart success" });
}

exports.deleteProductInCart = async (req, res) => {
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.id_product === "undefined"
  ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, id_product } = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (cartFind === null) {
    res.status(404).json({ msg: "not found" });
    return;
  }
  let index = cartFind.products.findIndex(
    element => element._id === id_product
  );
  if (index === -1) {
    res.status(404).json({ msg: "product not found in list" });
    return;
  }
  cartFind.products.splice(index, 1);
  try {
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products }
    });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "delete success" });
};