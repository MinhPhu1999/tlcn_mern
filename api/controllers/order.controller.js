'use trict'
const order = require("../models/order.model");
const cart = require("../models/cart.model")
const userController = require("../controllers/user.controller");
const randomstring = require("randomstring");
const nodemailer = require("../utils/nodemailer");

exports.addOrder = async (req, res) => {
	//kiểm tra có truyền tham số đủ hay không
	if (typeof req.body.id_user === "undefined" ||
		typeof req.body.city === "undefined" ||
		typeof req.body.posteCode === "undefined" ||
		typeof req.body.address === "undefined" ||
		typeof req.body.payment === "undefined" ||
		typeof req.body.shiping === "undefined" ||
		typeof req.body.phone === "undefined" ) {
	  res.status(422).send({message: "Invalid data" });
	  return;
	}
	//khai báo các biến cần thiết
	const {id_user, city, posteCode, address, phone, payment, shiping, paymentStatus} = req.body;
	// function isValidPhone(p) {
	// 	var phoneRe = /((09|03|07|08|05)+([0-9]{8})\b)/g;
	// 	return phoneRe.test(p);
	// }
	// function isValidPosteCode(p) {
	// 	var phoneRe = /(+([0-9]{6})\b)/g;
	// 	return phoneRe.test(p);
	// }

	// if(!isValidPhone(phone)){
	// 	return res.status(422).send("Số điện thoại không hợp lệ");
	// }
	// let paymentStatus = 'pending'
	// if(payment === 'paypal'){
	// 	paymentStatus = 'paid'
	// }
	const getDataUser = await userController.getDataByID(id_user);
	let cartFind = null;
	try {
	  cartFind = await cart.findOne({ id_user: id_user });//tìm kiếm order theo id_user và status
	} catch (err) {
	  console.log("error ", err);
	  res.status(500).send({message: err });
	  return;
	}
	if (cartFind === null) {//trường hợp không có cart trong db
	  res.status(404).send({message: "user not found" });
	  return;
	}
	let orderStatus = [
        {
          type: "ordered",
          date: new Date(),
          isCompleted: true,
        },
        {
          type: "packed",
          isCompleted: false,
        },
        {
          type: "shipped",
          isCompleted: false,
        },
        {
          type: "delivered",
          isCompleted: false,
        },
    ];
	//tạo mới order
	const new_order = new order({
	  id_user: id_user,
	  cart: cartFind.products,
	  city: city,
	  order_subtotal: Number(cartFind.grandTotal) + Number(shiping),
	  posteCode: posteCode,
	  address: address,
	  phone: phone,
	  name: getDataUser.name,
	  email: getDataUser.email,
	  shiping: shiping,
	  paymentStatus: paymentStatus,
	  payment: payment,
	  orderStatus: orderStatus
	});
	try {
	  await cartFind.remove();
	} catch (err) {
	  res.status(500).send({message: err });
	  console.log("cart remove fail");
	  return;
	}
	try {
		new_order.save();//lưu order
	} catch (err) {
	  res.status(500).send({message: err });
	  console.log("save order fail");
	  return;
	}
	res.status(201).send({message: "success" });//thông báo lưu thành công
};

exports.updateOrder = async (req, res) =>{
	if(typeof req.body.id_order === 'undefined' ||
		typeof req.body.type === 'undefined'){
			return res.status(422).send("Invalid Data");
	}
	const {id_order, type} = req.body;
	if(type === 'delivered')
	{
		await order.findByIdAndUpdate(id_order,
			{ $set: { paymentStatus: "paid"}});
	}
	order.updateOne(
		{ _id: id_order, "orderStatus.type": type },
		{
		  $set: {
			"orderStatus.$": [
			  { type: type, date: new Date(), isCompleted: true },
			],
		  },
		}
	  ).exec((error, order) => {
		if (error) 
			return res.status(400).send({ error });
		// if(order)
		// 	res.status(201).send("Success");
	});
	const orderFind = await order.findOne({ _id: id_order, "orderStatus.type": type });
	res.status(201).send({orderFind});
};

exports.getCustomerOrders = async (req, res) => {
	const orders = await order.find({})
	  .populate("cart._id", "name")
	  .exec();
	res.status(200).json({ orders });
};

exports.verifyPayment = async (req, res) => {
	//kiểm tra có truyền tham số đủ hay không
	if (typeof req.params.token === "undefined") {
	  res.status(402).send({message: "!invalid" });
	  return;
	}
	//khai báo các biến cần thiết
	let token = req.params.token;
	let tokenFind = null;
	try {
	  tokenFind = await order.findOne({ token: token });//tìm kiếm order theo token
	} catch (err) {
	  res.status(500).send({message: err });
	  return;
	}
	if (tokenFind == null) {//trường hợp không có order trong db
	  res.status(404).send({message: "order not found!!!" });
	  return;
	}
	try {
		//lưu lại các thay đổi
	  await order.findByIdAndUpdate(
		tokenFind._id,
		{ $set: { is_send: true } },
		{ new: true }
	  );
	} catch (err) {
	  res.status(500).send({message: err });
	  return;
	}
	res.status(200).send({message: "verify payment success!" });//thông báo verify thành công
};

exports.getOrderNoVerify = async (req, res) => {
	//khai báo các biến cần thiết
	let count = null;
	try {
		count = await order.countDocuments({ is_verify: false });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > totalPage) {
		res.status(200).send({ data: [], message: "Invalid page", totalPage });
		return;
	}
	//get order theo is_verify
	order.find({is_verify: false})
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
	//khai báo biến cần thiết
	let count = null;
	try {
		count = await order.countDocuments({ is_verify: true });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > totalPage) {
		res.status(200).send({ data: [], message: "Invalid page", totalPage });
		return;
	}
	//get order theo is_send
	order.find({is_verify: true})
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

exports.getOrderNoDeliver = async (req, res) => {
	//khai báo các biến cần thiết
	let count = null;
	try {
		count = await order.countDocuments({ is_delivering: false });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > totalPage) {
		res.status(200).send({ data: [], message: "Invalid page", totalPage });
		return;
	}
	//get order theo is_send
	order.find({is_delivering: false})
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

exports.getOrderDeliver = async (req, res) => {
	//khai báo biến cần thiết
	let count = null;
	try {
		count = await order.countDocuments({ is_verify: true });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > totalPage) {
		res.status(200).send({ data: [], message: "Invalid page", totalPage });
		return;
	}
	//get order theo is_send
	order.find({is_verify: true})
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
	//khai báo biến cần thiết
	// let count = null;
	// try {
	// 	count = await order.countDocuments({ is_send: true });//đếm order có trong db
	// } catch (err) {
	// 	console.log(err);
	// 	res.status(500).send({message: err });
	// 	return;
	// }
	// let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	// let { page } = req.params;
	// if (parseInt(page) < 1 || parseInt(page) > totalPage) {
	// 	res.status(200).send({ data: [], message: "Invalid page", totalPage });
	// 	return;
	// }
	// //get order
	// order.find()
	// 	.skip(9 * (parseInt(page) - 1))
	// 	.limit(9)
	// 	.exec((err, docs) => {
	// 		if(err) {
	// 			console.log(err);
	// 					res.status(500).send({message: err });
	// 					return;
	// 		}
	// 		res.status(200).send({ data: docs, totalPage });
	// })

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

exports.getAllorder = async(req, res) =>{
	const orderFind = await order.find({});
    if(orderFind){
        res.status(200).send(orderFind);
        return;
    }
    res.status(404).send({message: "order not found"});
}

exports.getAllOrder = async (req, res) => {
	//khai báo biến cần thiết
	let count = null;
	try {
		count = await order.countDocuments({});//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let totalPage = parseInt((count - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > totalPage) {
		res.status(200).send({ data: [], message: "Invalid page", totalPage });
		return;
	}
	//get order theo is_send
	order.find()
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
exports.getOrderDetail = async(req, res) =>{
	//kiểm tra có truyền tham số đủ hay không
	if (typeof req.params.id === "undefined") {
	  res.status(422).send({message: "Invalid data" });
	  return;
	}
	const id = req.params.id;
	const orderFind = await order.find({'_id':id});
	if(orderFind === null){
		return res.status(500).send("Order not found");
	}
	res.status(200).send(orderFind);

}

exports.deleteOrder = async(req, res) =>{
	//kiểm tra có truyền tham số đủ hay không
	if (typeof req.params.id === "undefined") {
	  res.status(422).send({message: "Invalid data" });
	  return;
	}
	const id = req.params.id;
	const orderFind = await order.findOne({_id: id});
	if(orderFind === null){
		return res.status(500).send("Order not found");
	}
	try {
		//lưu lại các thay đổi
	  await order.findByIdAndUpdate(id,
		{ $set: { paymentStatus: "cancelled"}});
	} catch (err) {
		return res.status(500).send({message: err });
	}
	res.status(200).send("Delete order success");
}
