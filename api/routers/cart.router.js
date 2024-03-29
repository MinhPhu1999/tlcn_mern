const cart_controller = require('../controllers/cart.controller');
const auth = require('../utils/auth');
module.exports = app => {
    app.route('/cart/:id_user').get(auth.authLogin, cart_controller.getCart);

    app.route('/cart/get/all').get(cart_controller.getAll);

    app.route('/cart/addcart').post(auth.authLogin, cart_controller.addToCart);

    app.route('/cart/updatetang').put(auth.authLogin, cart_controller.updateTang);

    app.route('/cart/updategiam').put(auth.authLogin, cart_controller.updateGiam);

    app.route('/cart/delete/:id_user').delete(auth.authLogin, cart_controller.deleteCart);

    app.route('/cart/remove').put(auth.authLogin, cart_controller.deleteProductInCart);
};
