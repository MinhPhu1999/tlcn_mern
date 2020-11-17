'use strict'
const stock_controller = require('../controllers/stock.controller');
module.exports = (app) => {
    app.route('/stock/all')
        .get(stock_controller.getAll);

}