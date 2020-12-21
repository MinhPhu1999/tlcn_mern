"use strict";
const cart = require("../models/cart.model");
const product = require('../models/product.model');
exports.addToCart = async (req, res) => {
  //kiểm tra có truyền tham số đủ hay không
  if (typeof req.body.id_user === 'undefined'
    || typeof req.body.products === 'undefined') {
      res.status(422).send({message: "invalid data" });
    return;
  }
  //khai báo các biến cần thiết
  const { id_user, products} = req.body;
  let cartFind = null;
  //tìm kiếm cart theo id
  cartFind = await cart.findOne({ id_user: id_user });
  if (cartFind === null) {//nếu không có sẵn cart thì tạo cart mới
    const cart_new = new cart({
      id_user: id_user,
      products: products,
      status: true
    });
    try {
      await cart_new.save()//lưu lại cart vừa tạo
                    .then(cart_new.updateCountProduct());//, cart_new.minusProduct());
    } catch (err) {
      res.status(500).send({message: err });
      return;
    }
  }
  else{//nếu đã có cart trong db
    for (let i = 0; i < products.length; i++) {
      let index = cartFind.products.findIndex(//tìm kiếm vị trí có id của product khi truyền vô bằng với id product của cart
        element => products[i]._id === element._id
      );
      if (index === -1) {//trường hợp không tìm thấy
        cartFind.products.push(products[i]);//thêm sản phẩm vào trong cart
        //tính grand total
        cartFind.grandTotal += (cartFind.products[cartFind.products.length - 1].price * cartFind.products[cartFind.products.length - 1].count);
      }
    }    
    try{
      await cartFind.save();//lưu những thay đổi
                    //.then(cartFind.minusProduct(req, res));
    }
    catch(err){//thông báo nếu add cart fail
      console.log(err);
      return res.status(500).send("Add cart fail");
    }
    // try {
    //   await cart.findByIdAndUpdate(cartFind._id, {
    //     $set: { products: cartFind.products,
    //             grandTotal: cartFind.grandTotal}}
    //             .then(cart.minusProduct()));
    // } catch (err) {
    //   console.log('lỗi');
    //   res.status(500).send({message: err });
    //   return;
    // }
  }
  res.status(200).send({message: "add cart success" });//thông báo nếu add thành công
}

exports.getCart = async (req,res)=>{
  //khai báo biến cần thiết
  const id_user = req.params.id_user;
  //tìm kiếm cart theo id của user
  const cartFind = await cart.findOne({id_user: id_user});
  if(cartFind){
      res.status(200).send(cartFind.products);
      return;
  }
  res.status(404).send({message: "cart not found"});
}

exports.getAll = async (req, res) => {
  //kiểm tra có truyền tham số đầy đủ hay không
  if (typeof req.params.id_user === "undefined") {
    res.status(422).send({message: "invalid data" });
    return;
  }
  //get tất cả cart có trong db theo id_user và status
  cart.findOne({ id_user: req.params.id_user, status: true }, (err, docs) => {
    if (err) {
      res.status(500).send({message: err });
      return;
    }
    res.status(200).send({ data: docs });
  });
}

exports.updateTang = async (req, res) => {
    //kiểm tra có truyền tham số đủ hay không
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  //khai báo các biến cần thiết
  const { id_user, id_product} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});//tìm kiếm cart theo id_user và status
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {//trường hợp không có cart trong db
    res.status(404).send({message: "cart not found" });
    return;
  }
  //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
  let index = cartFind.products.findIndex(
    element => id_product === element._id
  );
  cartFind.products[index].count += 1;//tăng số lượng lên 1
  cartFind.grandTotal += cartFind.products[index].price;//cập nhật lại grandtotal
  try{
    await cartFind.save();//lưu lại các thay đổi
                  //.then(cartFind.minusProduct());
  }
  catch(err){
    console.log(err);
    return res.status(500).send("Add cart fail");
  }
  // try {
  //   await cart.findByIdAndUpdate(cartFind._id, {
  //     $set: { products: cartFind.products,
  //             grandTotal: cartFind.grandTotal }
  //   });
  // } catch (err) {
  //   res.status(500).send({message: err });
  //   return;
  // }
  res.status(200).send({message: "update cart success" });
};

exports.updateGiam = async (req, res) => {
  //kiểm tra có truyền tham số đủ hay không
  if (typeof req.body.id_user === "undefined" ||
      typeof req.body.id_product === "undefined" ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  //khai báo các biến cần thiết
  const { id_user, id_product} = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true});//tìm kiếm cart theo id_user và status
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  if (cartFind === null) {//trường hợp không có cart trong db
    res.status(404).send({message: "product not found" });
    return;
  }
  //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
  let index = cartFind.products.findIndex(
    element => id_product === element._id
  );
  //giảm số lượng 1
  cartFind.products[index].count -= 1;
  cartFind.grandTotal -= cartFind.products[index].price;//cập nhật lại grandtotal
  try{
    await cartFind.save();//lưu các thay đổi
                  //.then(cartFind.plusProduct());
  }
  catch(err){//xuất thông báo lỗi nếu update fail
    console.log(err);
    return res.status(500).send("update cart fail");
  }

  // try {
  //   await cart.findByIdAndUpdate(cartFind._id, {
  //     $set: { products: cartFind.products,
  //             grandTotal: cartFind.grandTotal }
  //   });
  // } catch (err) {
  //   res.status(500).send({message: err });
  //   return;
  // }
  res.status(200).send({message: "update cart success" });//thông báo update thành công
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
  //kiểm tra có truyền tham số đủ hay không
  if (typeof req.params.id_user === "undefined") {
    res.status(422).send({message: "invalid data" });
    return;
  }
  //khai báo các biến cần thiết
  const { id_user } = req.params;

  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });//tìm kiếm cart theo id_user và status
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  //trường hợp không có cart trong db
  if (cartFind === null) {
    res.status(404).send({message: "cart not found" });
    return;
  }
  //cartFind.status = false;
  try {
    await cartFind.remove();//thực hiện xóa cart
  }
  catch (err) {
      res.status(500).send({message: err });
      return;
  }

  res.status(200).send({message: "delete cart success" });//thông báo xóa cart thành công
}

exports.deleteProductInCart = async (req, res) => {
  //kiểm tra có truyền tham số đủ hay không
  if (
    typeof req.body.id_user === "undefined" ||
    typeof req.body.id_product === "undefined"
  ) {
    res.status(422).send({message: "invalid data" });
    return;
  }
  //khai báo các biến cần thiết
  const { id_user, id_product } = req.body;
  let cartFind = null;
  try {
    cartFind = await cart.findOne({ id_user: id_user, status: true });//tìm kiếm cart theo id_user và status
  } catch (err) {
    res.status(500).send({message: err });
    return;
  }
  //trường hợp không có cart trong db
  if (cartFind === null) {
    res.status(404).send({message: "not found" });
    return;
  }
  //tìm kiếm vị trí id_product truyền vào bằng với id_product có trong cart
  let index = cartFind.products.findIndex(
    element => element._id === id_product
  );
  //trường hợp không tìm thấy product có trong cart
  if (index === -1) {
    res.status(404).send({message: "product not found in list" });
    return;
  }
  cartFind.grandTotal -= (cartFind.products[index].count * cartFind.products[index].price );//update lại grandtotal
  cartFind.products.splice(index, 1);//xóa sản phẩm trong cart

  try {
    //lưu lại các thay đổi
    await cart.findByIdAndUpdate(cartFind._id, {
      $set: { products: cartFind.products,
              grandTotal: cartFind.grandTotal }
    });

  } catch (err) {
    console.log(err);
    res.status(500).send({message: err });
    return;
  }
  res.status(200).send({message: "delete success" });//thông báo xóa thành công
};