'use strict'
const product_controller = require('../controllers/product.controller');

module.exports = (app) => {
    app.route('/product/getproduct')
        .get(product_controller.getProduct);
        
    app.route('/product/searchproduct')
        .post(product_controller.searchProduct);

    app.route('/product/getproductbybrand')
        .post(product_controller.getProductByBrand);

    app.route('/product/getproductbycategory')
        .post(product_controller.getProductByCategory);

    app.route('/product/amount/:id')
        .post(product_controller.getNameByID);

}