const product_controller = require('../controllers/product.controller');

module.exports = (app) => {
    app.route('/product/getproduct/:page')
        .get(product_controller.getProduct);
    app.route('/product')
        .get(product_controller.getAllProduct);

    app.route('/product/:id')
        .get(product_controller.getProductByID);

    app.route('/updateRate/:id')
        .patch(product_controller.reView);
        
    app.route('/product/search/:search')
        .get(product_controller.searchProduct);

    app.route('/product/brand/:brand')
        .get(product_controller.getProductByBrand);

    app.route('/product/category')
        .patch(product_controller.getProductByCategory);

    app.route('/product/amount/:id')
        .post(product_controller.getNameByID);
    
    app.route('/product/sort/:inc')
        .get(product_controller.sortProduct);

}