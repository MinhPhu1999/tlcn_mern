const comment_controller = require('../controllers/comment.controller');

module.exports = (app) => {
    app.route('/comment/:id')
        .get(comment_controller.getComment);

}