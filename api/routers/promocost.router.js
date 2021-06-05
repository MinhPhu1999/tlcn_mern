const promocost = require('../controllers/promocost.controller');

module.exports = app => {
    app.route('/admin/promocosts/add').post(promocost.addPromotionCost);
    app.route('/admin/promocosts/update').put(promocost.updatePromoCost);
    app.route('/admin/promocosts/:id').patch(promocost.deletePromoCost);
    app.route('/admin/promocosts').get(promocost.getPromoCost);
    app.route('/admin/promocosts/check').post(promocost.check);
};
