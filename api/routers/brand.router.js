const brand_controller = require('../controllers/brand.controller');
module.exports = (app) => {
    app.route('/brand/all')
        .get(brand_controller.getBrand);

    app.route('/brand/name/:id')
        .get(brand_controller.getNameByID);

        
}