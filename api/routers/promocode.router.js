const promocode = require('../controllers/promocode.controller');

module.exports = app => {
    app.route('/admin/promocodes/add').post(promocode.addPromotionCode);
    app.route('/admin/promocodes/update').put(promocode.updatePromoCode);
    app.route('/admin/promocodes/:id').patch(promocode.deletePromoCode);
    app.route('/admin/promocodes').get(promocode.getPromoCodes);
    app.route('/admin/promocodes/check').post(promocode.check);
};
