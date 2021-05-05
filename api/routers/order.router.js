const order_controller = require('../controllers/order.controller');
const auth = require('../utils/auth');
module.exports = (app) => {
    app.route('/order/addorder').post(
        auth.authLogin,
        order_controller.addOrder
    );
    app.route('/order/detail/:id').get(
        auth.authLogin,
        order_controller.getOrderDetail
    );
    app.route('/order/admindetail/:id').get(order_controller.getOrderDetail);
    app.route('/order/:id').put(order_controller.deleteOrder);
    app.route('/order/update').post(order_controller.updateOrder);
    app.route('/order/getall/:page').get(order_controller.getAllOrder);
    app.route('/order/all').get(order_controller.getAllorder);

    app.route('/order/getCustomerOrders').post(
        auth.authLogin,
        order_controller.getCustomerOrders
    );
    app.route('/order/getorder/:id_user').get(
        auth.authLogin,
        order_controller.getOrder
    );

    app.route('/order/checkcancomment').post(order_controller.checkCanComment);
};
