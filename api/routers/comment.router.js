const comment_controller = require('../controllers/comment.controller');

module.exports = (app) => {
    app.route('/comment/:id').get(comment_controller.getComment);

    app.route('/comment').put(comment_controller.updateComment);
	
    app.route('/comment/:id').put(comment_controller.deleteComment);
};
