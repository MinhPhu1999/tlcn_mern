'use trict'
const order = require("../models/order.model");
const randomstring = require("randomstring");
const nodemailer = require("../utils/nodemailer");

exports.addOrder = async (req, res) => {
	if (typeof req.body.id_user === 'undefined'){
	  res.status(422).json({ msg: "Invalid data" });
	  return;
	}
	
	const {id_user, cart, order_status, order_subtotal, order_date, city, country, posteCode, phone, address, email} = req.body;
	var orderFind = null;
	orderFind = await order.findOne({id_user:id_user});
	// console.log('test gui mail');
	// const token = randomstring.generate();
	// //let sendEmail = await nodemailer.sendMailConfirmPayment(email, token);
	// let sendEmail = await nodemailer.sendEmail(email, token);
	// if (!sendEmail) {
	//   res.status(500).json({ msg: "Send email fail" });
	//   return;
	// }
	// else{
	// 	console.log('gui mail thanh cong');
	// }
	const new_order = new order({
		id_user: id_user,
		cart:cart,
		order_status: order_status,
		order_subtotal: order_subtotal,
		order_date: order_date,
		city:city,
		country:country,
		posteCode:posteCode,
		phone:phone,
		address:address,
		email:email
	});

	try {
	  await new_order.save();
	} catch (err) {
	  res.status(500).json({ msg: err });
	  console.log("save order fail");
	  return;
	}

	// for(let i = 0;i < cart.length; i++){
	// 	let index = orderFind.cart.findIndex(
	// 		element => cart[i]._id === element._id
	// 	);
	// 	console.log(index);
	// 	if(index === -1){
	// 		orderFind.cart.push(cart[i]);
	// 	}else{
	// 		orderFind.cart[index].count += Number(cart[i].count);
	// 	}
	// }
	// try{
	// 	await order.findByIdAndUpdate(orderFind._id,{
	// 		$set: {cart: orderFind.cart}
	// 	});
	// }catch(err){
	// 	res.status(500).json({msg: err});
	// 	return;
	// }

	res.status(201).json({ msg: "success" });
};