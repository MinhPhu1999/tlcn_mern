const banner_controller = require('../controllers/banner.controller');

module.exports = app => {
    app.route('/banners').get(banner_controller.getBanners);
};
