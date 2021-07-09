const order_controller = require('../controllers/order.controller');
const auth = require('../utils/auth');
module.exports = app => {
    app.route('/order/addorder').post(order_controller.addOrder);

    app.route('/orders').get(order_controller.orders);

    app.route('/order/detail/:id').get(order_controller.getOrderDetail);

    app.route('/order/admindetail/:id').get(order_controller.getOrderDetail);

    app.route('/order/:id').put(order_controller.deleteOrder);

    app.route('/order/update').post(order_controller.updateOrder);

    app.route('/order/getall/:page').get(order_controller.getAllOrder);

    app.route('/order/all').get(order_controller.getAllorder);

    app.route('/order/getCustomerOrders').post(auth.authLogin, order_controller.getCustomerOrders);

    app.route('/order/getorder/:id_user').post(order_controller.getOrder);

    app.route('/order/all/:id_user').get(order_controller.getAllOrderByUser);

    app.route('/order/checkcancomment').post(order_controller.checkCanComment);
};
