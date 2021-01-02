const cart_controller = require('../controllers/cart.controller');
const auth = require('../utils/auth');
module.exports = (app) => {
    app.route('/cart/:id_user')
		.get(cart_controller.getCart);
		
    app.route('/cart/all')
		.get(cart_controller.getAll);
		
	app.route('/cart/addcart')
		.post(auth.authLogin, cart_controller.addToCart);
		
    app.route('/cart/updatetang')
		.put(cart_controller.updateTang);

    app.route('/cart/updategiam')
		.put(cart_controller.updateGiam);
		
    app.route('/cart/delete/:id_user')
		.delete(cart_controller.deleteCart);
		
	app.route('/cart/remove')
		.put(cart_controller.deleteProductInCart);
}