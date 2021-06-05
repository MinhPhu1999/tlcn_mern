const banner_controller = require('../controllers/banner.controller');

module.exports = app => {
    app.route('/admin/banner/add').post(banner_controller.addBanner);
    app.route('/admin/banner/update').put(banner_controller.updateBanner);
    app.route('/admin/banner/:id').patch(banner_controller.updateStatus);
};
