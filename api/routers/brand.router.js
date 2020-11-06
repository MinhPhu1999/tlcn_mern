'use strict'
const brand_controller = require('../controllers/brand.controller');
module.exports = (app) => {
    app.route('/brand')
        .get(brand_controller.getBrand);
    // app.route('/brand/all/:page')
    //     .get(brand_controller.getAll);
    app.route('/brand/all')
        .get(brand_controller.getAll);
    app.route('/brand/getbrand')
        .get(brand_controller.getBrand);
    app.route('/brand/name/:id')
        .get(brand_controller.getNameByID);
    app.route('/brand/addbrand')
        .post(brand_controller.addBrand);
    app.route('/brand/updatebrand')
        .post(brand_controller.updateBrand);
    app.route('/brand/delete/:id')
        .post(brand_controller.deleteBrand);
        
}