const brand_controller = require('../controllers/brand.controller');
module.exports = (app) => {
    app.route('/brands').get(brand_controller.getBrands);

    app.route('/brand/name/:id').get(brand_controller.getNameByID);
};
