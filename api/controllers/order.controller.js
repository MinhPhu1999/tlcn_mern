'use trict'
const order = require("../models/order.model");
const cart = require("../models/cart.model")
const userController = require("../controllers/user.controller");
const randomstring = require("randomstring");
const nodemailer = require("../utils/nodemailer");

exports.addOrder = async (req, res) => {
	if (typeof req.body.id_user === "undefined" ||
		typeof req.body.city === "undefined" ||
		typeof req.body.posteCode === "undefined" ||
		typeof req.body.address === "undefined" ||
		typeof req.body.phone === "undefined" ) {
	  res.status(422).send({message: "Invalid data" });
	  return;
	}

	const {id_user, city, posteCode, address, phone} = req.body;
	const getDataUser = await userController.getDataByID(id_user);
	let cartFind = null;
	try {
	  cartFind = await cart.findOne({ id_user: id_user, status: true });
	} catch (err) {
	  console.log("error ", err);
	  res.status(500).send({message: err });
	  return;
	}
	if (cartFind === null) {
	  res.status(404).send({message: "user not found" });
	  return;
	}
	const token = randomstring.generate();
	// let sendEmail = await nodemailer.sendMailConfirmPayment(email, token);
	// if (!sendEmail) {
	//   res.status(500).send({message: "Send email fail" });
	//   return;
	// }
	const new_order = new order({
	  id_user: id_user,
	  cart: cartFind.products,
	  city: city,
	  order_subtotal: cartFind.grandTotal,
	  posteCode: posteCode,
	  address: address,
	  phone: phone,
	  name: getDataUser.name,
	  order_status: false,
	  email: getDataUser.email,
	  token: token
	});
	// try {
	//   await cartFind.remove();
	// } catch (err) {
	//   res.status(500).send({message: err });
	//   console.log("cart remove fail");
	//   return;
	// }
	try {
		new_order.save();
	} catch (err) {
	  res.status(500).send({message: err });
	  console.log("save order fail");
	  return;
	}
	res.status(201).send({message: "success" });
};

exports.deleteOrder = async(req,res)=>{
	if (typeof req.params.id === "undefined") {
		res.status(402).send({message: "data invalid" });
		return;
	  }
	  let orderFind = null;
	  try {
		orderFind = await order.findOne({ _id: req.params.id, is_send: false, order_status: true });
	  } catch (err) {
		console.log(err);
		res.status(500).send({message: "server found" });
		return;
	  }
	  if (orderFind === null) {
		res.status(400).send({message: "order not found" });
		return;
	  }
	  orderFind.order_status = false;
	  try {
		orderFind.save();
	  } catch (err) {
		console.log(err);
		res.status(500).send({message: "server found" });
		return;
	  }
	  res.status(200).send({message: "delete order success" });
};

exports.verifyPayment = async (req, res) => {
	if (typeof req.params.token === "undefined") {
	  res.status(402).send({message: "!invalid" });
	  return;
	}
	let token = req.params.token;
	let tokenFind = null;
	try {
	  tokenFind = await order.findOne({ token: token });
	} catch (err) {
	  res.status(500).send({message: err });
	  return;
	}
	if (tokenFind == null) {
	  res.status(404).send({message: "order not found!!!" });
	  return;
	}
	try {
	  await order.findByIdAndUpdate(
		tokenFind._id,
		{ $set: { is_send: true } },
		{ new: true }
	  );
	} catch (err) {
	  res.status(500).send({message: err });
	  return;
	}
	res.status(200).send({message: "verify payment success!" });
};

exports.getOrderNoVerify = async (req, res) => {
  let count = null;
  try {
    count = await order.countDocuments({ is_send: false });
  } catch (err) {
    console.log(err);
    res.status(500).send({message: err });
    return;
  }
  let totalPage = parseInt((count - 1) / 9 + 1);
  let { page } = req.params;
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).send({ data: [], message: "Invalid page", totalPage });
    return;
  }
  order.find({is_send: false})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    })
};

exports.getOrderVerify = async (req, res) => {
  let count = null;
  try {
    count = await order.countDocuments({ is_send: true });
  } catch (err) {
    console.log(err);
    res.status(500).send({message: err });
    return;
  }
  let totalPage = parseInt((count - 1) / 9 + 1);
  let { page } = req.params;
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).send({ data: [], message: "Invalid page", totalPage });
    return;
  }
  order.find({is_send: true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).send({message: err });
                    return;
        }
        res.status(200).send({ data: docs, totalPage });
    })
};

exports.getOrder = async(req, res) =>{
	if(typeof req.params.id_user === 'undefined'){
		return res.status(500).send("Invalid Data")
	}
	const id_user = req.params.id_user;
	const orderFind = await order.find({id_user: id_user});
	if(orderFind){
		return res.status(200).send(orderFind);
	}
	res.status(404).send({message: "orders not found"});

}