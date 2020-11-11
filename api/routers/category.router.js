'use strict'
const category_controller = require('../controllers/category.controller');
module.exports = (app) => {
    app.route('/category')  
        .get(category_controller.getCategory);
    app.route('/category/all')
        .get(category_controller.getAll);
    app.route('/category/name/:id')
        .get(category_controller.getNameByID);

}