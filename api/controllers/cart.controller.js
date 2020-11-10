"use strict";
const cart = require("../models/cart.model");
exports.addToCart = async (req, res) => {
  if (typeof req.body.id_user === 'undefined'
    || typeof req.body.products === 'undefined'
    || typeof req.body.date === 'undefined') {
      res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user, products, date} = req.body;
  let cartFind = null;
  cartFind = await cart.findOne({ id_user: id_user });
  if (cartFind === null) {
    const cart_new = new cart({
      id_user: id_user,
      products: products,
      date: date,
      status: true
    });
    try {
      await cart_new.save();
      //console.log("thanh cong");
    } catch (err) {
      res.status(500).json({ msg: err });
      return;
    }
  }else{
    for (let i = 0; i < products.length; i++) {
      let index = cartFind.products.findIndex(
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

exports.getCart = async(req,res)=>{
  cart.find({status:true},(err,res)=>{
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

exports.updateCart = async (req, res) => {
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.products === "undefined" ) {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  
  const { id_user, products} = req.body;
  var cartFind = null;
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

  for (let i = 0; i < products.length; i++) {
    let index = cartFind.products.findIndex(
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
  res.status(200).json({ msg: "success" });
};

exports.deleteCart = async (req, res) => {
  if (typeof req.params.id_user === "undefined") {
    res.status(422).json({ msg: "invalid data" });
    return;
  }
  const { id_user } = req.params;

  var cartFind = null;
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

  res.status(200).json({ msg: "success" });
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
  var cartFind = null;
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
  res.status(200).json({ msg: "success" });
};