const promocode = require('../controllers/promocode.controller');

module.exports = app => {
    app.route('/promocodes').get(promocode.getPromoCodes);
    app.route('/promocodes/check').post(promocode.check);
};
