const order_controller = require('../controllers/order.controller');
module.exports = (app) => {
    app.route('/order/addorder')
        .post(order_controller.addOrder);
    app.route('/order/:id')
        .get(order_controller.getOrderDetail);
    app.route('/order/:id')
        .put(order_controller.deleteOrder);
    app.route('/order/deleteorder/:id')
        .put(order_controller.deleteOrder);
    app.route('/order/verify/:token')
        .get(order_controller.verifyPayment);
    app.route('/order/status/false')
        .get(order_controller.getOrderNoVerify);
    app.route('/order/getorder/:id_user')
        .get(order_controller.getOrder);
    app.route('/order/status/true')
        .get(order_controller.getOrderVerify);
        
}