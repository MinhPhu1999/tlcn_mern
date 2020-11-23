'use strict'
const product_controller = require('../controllers/product.controller');

module.exports = (app) => {
    app.route('/product/getallproduct/:page')
        .get(product_controller.getAllProduct);
        
    app.route('/product/searchproduct')
        .post(product_controller.searchProduct);

    app.route('/product/getproductbybrand')
        .post(product_controller.getProductByBrand);

    app.route('/product/getproductbycategory')
        .post(product_controller.getProductByCategory);

}