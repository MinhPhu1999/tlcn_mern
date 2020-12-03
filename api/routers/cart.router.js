'use strict'
const cart_controller = require('../controllers/cart.controller');
module.exports = (app) => {
    app.route('/cart')
		.get(cart_controller.getCart);
		
    app.route('/cart/all')
		.get(cart_controller.getAll);
		
	app.route('/cart/addcart')
		.post(cart_controller.addToCart);
		
    app.route('/cart/updatecart')
		.post(cart_controller.update);
		
    app.route('/cart/delete/:id_user')
		.put(cart_controller.deleteCart);
		
	app.route('/cart/remove')
		.delete(cart_controller.deleteProductInCart);
}