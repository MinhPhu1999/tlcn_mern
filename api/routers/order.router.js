const order_controller = require('../controllers/order.controller');
module.exports = (app) => {
    app.route('/order/addorder')
        .post(order_controller.addOrder);
    app.route('/order/detail/:id')
        .get(order_controller.getOrderDetail);
    app.route('/order/:id')
        .put(order_controller.deleteOrder);
    app.route('/order/update')
        .post(order_controller.updateOrder);
    app.route('/order/getall/:page')
        .get(order_controller.getAllOrder);
    app.route('/order/all')
        .get(order_controller.getAllorder);
    // app.route('/order/deleteorder/:id')
    //     .put(order_controller.deleteOrder);
    // app.route('/order/verify/:id_order')
    //     .get(order_controller.isVerify);
    // app.route('/order/shiping/:id_order')
    //     .get(order_controller.isShiping);
    // app.route('/order/deliver/:id_order')
    //     .get(order_controller.isDelever);
    // app.route('/order/status/false')
    //     .get(order_controller.getOrderNoVerify);
    app.route('/order/getorder/:id_user')
        .get(order_controller.getOrder);
    // app.route('/order/status/true')
    //     .get(order_controller.getOrderVerify);
        
}