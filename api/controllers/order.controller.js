'use trict'
const order = require("../models/order.model");
const cart = require("../models/cart.model")
const userController = require("../controllers/user.controller");

const {performance} = require('perf_hooks');

const randomstring = require("randomstring");
const nodemailer = require("../utils/nodemailer");
const validate = require('../utils/validate');
const { Console } = require("console");

exports.addOrder = async (req, res) => {
	//kiểm tra có truyền tham số đủ hay không
	if (typeof req.body.id_user === "undefined" ||
		typeof req.body.city === "undefined" ||
		typeof req.body.posteCode === "undefined" ||
		typeof req.body.address === "undefined" ||
		typeof req.body.payment === "undefined" ||
		typeof req.body.shiping === "undefined" ||
		typeof req.body.phone === "undefined" ) {
	  return res.status(422).send({message: "Invalid data" });
	}
	//khai báo các biến cần thiết
	const {id_user, city, posteCode, address, phone, payment, shiping} = req.body;

	// if(!validate.isValidPhone(phone)){
	// 	return res.status(422).send({message: "Số điện thoại không hợp lệ"});
	// }
	// if(!validate.isValidPosteCode(posteCode)){
	// 	return res.status(422).send({message: "PosteCode không hợp lệ"})
	// }
	let paymentStatus = 'pending'
	if(payment === 'Paypal'){
		paymentStatus = 'paid'
	}
	const getDataUser = await userController.getDataByID(id_user);
	let cartFind = null;
	try {
	  	cartFind = await cart.findOne({ id_user: id_user });//tìm kiếm order theo id_user và status
	}catch (err) {
	  	return res.status(500).send({message: err });
	}
	if (cartFind === null) {//trường hợp không có cart trong db
		return res.status(404).send({message: "user not found" });
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
	  name: getDataUser[0],
	  email: getDataUser[1],
	  shiping: shiping,
	  paymentStatus: paymentStatus,
	  payment: payment,
	  orderStatus: orderStatus
	});

	try {
		await cartFind.remove();
		await new_order.save();
	}catch (err) {
	  	return res.status(500).send({message: err });
	}

	// try {
	// 	new_order.save();//lưu order
	// } catch (err) {
	//   res.status(500).send({message: err });
	//   console.log("save order fail");
	//   return;
	// }
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
	});
	const orderFind = await order.findOne({ _id: id_order, "orderStatus.type": type });
	res.status(201).send({orderFind});
};

exports.getOrderByDay = async (req, res) =>{
	if(	typeof req.body.day === "undefined" ||
		typeof req.body.month === "undefined" ||
		typeof req.body.year === "undefined") {
			return res.status(402).send({message: "!invalid" });
	  	}

	let { day, month, year } = req.body;
	let orderFind = null;

	try{
		orderFind = await order.find({
		  	date: {	$gte: new Date(year, month - 1, day),
					$lt: new Date(year, month - 1, parseInt(day) + 1) },
		  	paymentStatus: "paid" });

	}catch(err) {
		return res.status(500).send({message: err });
	}
	res.status(200).json({ orderFind });
};

exports.getOrderByMonth = async (req, res) =>{

	if(	typeof req.body.year === "undefined" ||
		typeof req.body.month === "undefined") {
			return res.status(402).send({message: "!invalid" });
	}
	
	let { month, year } = req.body;

	let orderFind = null;
	try{
		orderFind = await order.find({
			order_date: { $gte: new Date(year, parseInt(month) - 1, 1),
						  $lt: new Date(year, month, 1)},
			paymentStatus: "paid"
		});
	}catch (err) {
		return res.status(500).send({message: err });
	}

	res.status(200).json({ orderFind });
};

exports.getOrderByYear = async (req, res) =>{
	if(typeof req.body.year === "undefined") {
		return res.status(402).send({message: "!invalid" });
	}

	let { year } = req.body;
	// var t0 = performance.now();

	let getOrder = await order.find({paymentStatus: "paid"});
	let index = 0;
	let orderFind;
	let arrOr = [];
	let lenOrder = getOrder.length;

	for(let i = 1; i < 13; i++){
		orderFind = 0;

		while(index < lenOrder){
			if((getOrder[index].order_date >= new Date(year, i-1, 1)) && 
				(getOrder[index].order_date < new Date(parseInt(year), i, 1))) {
				orderFind ++;
			}
			index ++;
		}
		arrOr.push(orderFind);
		index = orderFind;
	}
	res.status(200).json({ arrOr });
};

exports.getQuantityByYear = async (req, res) =>{

	if(typeof req.body.year === "undefined") {
		return res.status(402).send({message: "!invalid" });
	}

	let { year } = req.body;
	// var t0 = performance.now();

	let getOrder = await order.find({paymentStatus: "paid"});
	let index = 0;
	let dem = 0;
	let orderFind;
	let arrOr = [];
	let lenOrder = getOrder.length;

	for(let i = 1; i < 13; i++){
		orderFind = 0;
		dem = 0;
		
		while(index < lenOrder){
			let lenCart = getOrder[index].cart.length;
			
			if((getOrder[index].order_date >= new Date(year, i-1, 1)) && 
				(getOrder[index].order_date < new Date(parseInt(year), i, 1))) {

				for(let j = 0; j < lenCart; j++){
					orderFind += getOrder[index].cart[j].quantity;
				}

				dem ++;
			}
			index ++;
		}
		
		arrOr.push(orderFind);
		index = dem;
	}
	// var t1 = performance.now();

	// console.log(t1-t0);

	res.status(200).json({ arrOr });
};


exports.getOrderTop10 = async (req, res) => {
	let orderFind = null;

	try{
	  	orderFind = await order.find({ paymentStatus: "paid" });
	}catch (err) {
		return res.status(500).send({message: err });
	}

	let arr = [];
	let len = orderFind.length;

	for (let i = 0; i < len; i++) {
	  	let lenP = orderFind[i].cart.length;
		for (let j = 0; j < lenP; j++) {
			let index = arr.findIndex(
				element => orderFind[i].cart[j]._id === element._id
			);
			if (index === -1) {
				arr.push(orderFind[i].cart[j]);
			} else {
				arr[index].quantity += Number(orderFind[i].cart[j].quantity);
			}
		}
	}

	arr.sort(function(a, b) {
	  	return b.quantity - a.quantity;
	});

	res.status(200).json({ data: arr.length > 10 ? arr.slice(0, 10) : arr });
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
	  return res.status(402).send({message: "!invalid" });
	}
	//khai báo các biến cần thiết
	let token = req.params.token;
	let tokenFind = null;
	try {
	  tokenFind = await order.findOne({ token: token });//tìm kiếm order theo token
	} catch (err) {
	  return res.status(500).send({message: err });
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
	let quantity = null;
	try {
		quantity = await order.quantityDocuments({ is_verify: false });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
		res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
			res.status(200).send({ data: docs, quantityPage });
	})
};

exports.getOrderVerify = async (req, res) => {
	//khai báo biến cần thiết
	let quantity = null;
	try {
		quantity = await order.quantityDocuments({ is_verify: true });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
		res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
			res.status(200).send({ data: docs, quantityPage });
	})
};

exports.getOrderNoDeliver = async (req, res) => {
	//khai báo các biến cần thiết
	let quantity = null;
	try {
		quantity = await order.quantityDocuments({ is_delivering: false });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
		res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
			res.status(200).send({ data: docs, quantityPage });
	})
};

exports.getOrderDeliver = async (req, res) => {
	//khai báo biến cần thiết
	let quantity = null;
	try {
		quantity = await order.quantityDocuments({ is_verify: true });//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
		res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
			res.status(200).send({ data: docs, quantityPage });
	})
};

exports.getOrder = async(req, res) =>{
	//khai báo biến cần thiết
	// let quantity = null;
	// try {
	// 	quantity = await order.quantityDocuments({ is_send: true });//đếm order có trong db
	// } catch (err) {
	// 	console.log(err);
	// 	res.status(500).send({message: err });
	// 	return;
	// }
	// let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	// let { page } = req.params;
	// if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
	// 	res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
	// 		res.status(200).send({ data: docs, quantityPage });
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

};

exports.getAllorder = async(req, res) =>{
	const orderFind = await order.find({});
    if(orderFind){
		// console.log(typeof orderFind[0].order_subtotal)
        res.status(200).send(orderFind);
        return;
    }
    res.status(404).send({message: "order not found"});
};

exports.getAllOrder = async (req, res) => {
	//khai báo biến cần thiết
	let quantity = null;
	try {
		quantity = await order.quantityDocuments({});//đếm order có trong db
	} catch (err) {
		console.log(err);
		res.status(500).send({message: err });
		return;
	}
	let quantityPage = parseInt((quantity - 1) / 9 + 1);//tính số trang
	let { page } = req.params;
	if (parseInt(page) < 1 || parseInt(page) > quantityPage) {
		res.status(200).send({ data: [], message: "Invalid page", quantityPage });
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
			res.status(200).send({ data: docs, quantityPage });
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

};

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
};
