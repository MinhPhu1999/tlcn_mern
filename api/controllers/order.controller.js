'use trict'
const order = require("../models/order.model");
const cart = require("../models/cart.model")
const userController = require("../controllers/user.controller");
const randomstring = require("randomstring");
const nodemailer = require("../utils/nodemailer");

exports.addOrder = async (req, res) => {
	if (typeof req.body.id_user === "undefined" ||
		typeof req.body.city === "undefined" ||
		typeof req.body.order_subtotal === 'undefined' ||
		typeof req.body.order_date === "undefined" ||
		typeof req.body.posteCode === "undefined" ||
		typeof req.body.address === "undefined" ||
		typeof req.body.phone === "undefined" ) {
	  res.status(422).json({ msg: "Invalid data" });
	  return;
	}

	const {id_user,city,order_subtotal,order_date,posteCode,address,phone} = req.body;
	const getDataUser = await userController.getDataByID(id_user);
	var cartFind = null;
	try {
	  cartFind = await cart.findOne({ id_user: id_user, status: true });
	} catch (err) {
	  console.log("error ", err);
	  res.status(500).json({ msg: err });
	  return;
	}
	if (cartFind === null) {
	  res.status(404).json({ msg: "user not found" });
	  return;
	}
	const token = randomstring.generate();
	// let sendEmail = await nodemailer.sendMailConfirmPayment(email, token);
	// if (!sendEmail) {
	//   res.status(500).json({ msg: "Send email fail" });
	//   return;
	// }
	const new_order = new order({
	  id_user: id_user,
	  cart: cartFind.products,
	  city: city,
	  order_date: order_date,
	  order_subtotal: order_subtotal,
	  posteCode: posteCode,
	  address: address,
	  phone: phone,
	  name: getDataUser[0],
	  order_status: true,
	  email: getDataUser[1],
	  token: token
	});
	// try {
	//   await cartFind.remove();
	// } catch (err) {
	//   res.status(500).json({ msg: err });
	//   console.log("cart remove fail");
	//   return;
	// }
	try {
		new_order.save();
	} catch (err) {
	  res.status(500).json({ msg: err });
	  console.log("save bill fail");
	  return;
	}
	res.status(201).json({ msg: "success" });
};

exports