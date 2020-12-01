'use strict'
const product_controller = require('../controllers/product.controller');

module.exports = (app) => {
    app.route('/product')
        .get(product_controller.getProduct);

    app.route('/product/:id')
        .get(product_controller.getProductByID);
        
    app.route('/product/search')
        .post(product_controller.searchProduct);

    app.route('/product/brand')
        .post(product_controller.getProductByBrand);

    app.route('/product/category')
        .post(product_controller.getProductByCategory);

    app.route('/product/amount/:id')
        .post(product_controller.getNameByID);

    app.route('/product/sortprice')
        .get(product_controller.sortProduct);

}