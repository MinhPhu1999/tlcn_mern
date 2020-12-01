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
		typeof req.body.posteCode === "undefined" ||
		typeof req.body.address === "undefined" ||
		typeof req.body.phone === "undefined" ) {
	  res.status(422).json({ msg: "Invalid data" });
	  return;
	}

	const {id_user, city, order_subtotal, posteCode, address, phone} = req.body;
	const getDataUser = await userController.getDataByID(id_user);
	let cartFind = null;
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
	  console.log("save order fail");
	  return;
	}
	res.status(201).json({ msg: "success" });
};

exports.deleteOrder = async(req,res)=>{
	if (typeof req.params.id === "undefined") {
		res.status(402).json({ msg: "data invalid" });
		return;
	  }
	  let orderFind = null;
	  try {
		orderFind = await order.findOne({ _id: req.params.id, is_send: false, order_status: true });
	  } catch (err) {
		console.log(err);
		res.status(500).json({ msg: "server found" });
		return;
	  }
	  if (orderFind === null) {
		res.status(400).json({ msg: "order not found" });
		return;
	  }
	  orderFind.order_status = false;
	  try {
		orderFind.save();
	  } catch (err) {
		console.log(err);
		res.status(500).json({ msg: "server found" });
		return;
	  }
	  res.status(200).json({ msg: "delete order success" });
};

exports.verifyPayment = async (req, res) => {
	if (typeof req.params.token === "undefined") {
	  res.status(402).json({ msg: "!invalid" });
	  return;
	}
	let token = req.params.token;
	let tokenFind = null;
	try {
	  tokenFind = await order.findOne({ token: token });
	} catch (err) {
	  res.status(500).json({ msg: err });
	  return;
	}
	if (tokenFind == null) {
	  res.status(404).json({ msg: "order not found!!!" });
	  return;
	}
	try {
	  await order.findByIdAndUpdate(
		tokenFind._id,
		{ $set: { is_send: true } },
		{ new: true }
	  );
	} catch (err) {
	  res.status(500).json({ msg: err });
	  return;
	}
	res.status(200).json({ msg: "verify payment success!" });
};

exports.getOrderNoVerify = async (req, res) => {
  let count = null;
  try {
    count = await order.countDocuments({ is_send: false });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  let totalPage = parseInt((count - 1) / 9 + 1);
  let { page } = req.params;
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).json({ data: [], msg: "Invalid page", totalPage });
    return;
  }
  order.find({is_send: false})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({ data: docs, totalPage });
    })
};

exports.getOrderVerify = async (req, res) => {
  let count = null;
  try {
    count = await order.countDocuments({ is_send: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  let totalPage = parseInt((count - 1) / 9 + 1);
  let { page } = req.params;
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).json({ data: [], msg: "Invalid page", totalPage });
    return;
  }
  order.find({is_send: true})
    .skip(9 * (parseInt(page) - 1))
    .limit(9)
    .exec((err, docs) => {
        if(err) {
            console.log(err);
                    res.status(500).json({ msg: err });
                    return;
        }
        res.status(200).json({ data: docs, totalPage });
    })
};