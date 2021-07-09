const color_controller = require('../controllers/color.controller');

module.exports = app => {
    app.route('/color/getcolors').get(color_controller.getColors);
};
