const banner_controller = require('../controllers/banner.controller');

module.exports = app => {
    app.route('/admin/addbanner').post(banner_controller.addBanner);
};
