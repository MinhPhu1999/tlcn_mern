const size_controller = require('../controllers/size.controller');

module.exports = app => {
    app.route('/size/getsizes').get(size_controller.getSizes);
};
