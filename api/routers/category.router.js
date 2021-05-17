const category_controller = require('../controllers/category.controller');
module.exports = (app) => {
    app.route('/categorys').get(category_controller.getCategorys);
	
    app.route('/category/name/:id').get(category_controller.getNameByID);
};
