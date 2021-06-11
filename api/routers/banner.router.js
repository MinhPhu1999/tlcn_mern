const banner_controller = require('../controllers/banner.controller');

module.exports = app => {
    app.route('/admin/banners/add').post(banner_controller.addBanner);
    app.route('/admin/banners/update').put(banner_controller.updateBanner);
    app.route('/admin/banners/status/:id').patch(banner_controller.updateStatus);
    app.route('/admin/banners/:id').get(banner_controller.getBanner);
    app.route('/admin/banners').get(banner_controller.getBanners);
};
