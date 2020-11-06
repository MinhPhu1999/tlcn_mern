'use strict'
const category_controller = require('../controllers/category.controller');
module.exports = (app) => {
    app.route('/category')
        .get(category_controller.getCategory);
    app.route('/category/all')
        .get(category_controller.getAll);
    app.route('/category/getcategory')
        .get(category_controller.getCategory);
    app.route('/category/name/:id')
        .get(category_controller.getNameByID);
    app.route('/category/addcategory')
        .post(category_controller.addCategory);
    app.route('/category/updatecategory')
        .post(category_controller.updateCategory);
    app.route('/category/delete/:id')
        .post(category_controller.deleteCategory);
}