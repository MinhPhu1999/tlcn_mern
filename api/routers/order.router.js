'use strict'
const order_controller = require('../controllers/order.controller');
module.exports = (app) => {
    app.route('/order/addorder')
        .post(order_controller.addOrder);

        
}