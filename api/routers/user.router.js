//const passport = require('passport');
const user_controller = require('../controllers/user.controller');
const auth = require('../utils/auth');
//require('../../passport')(passport);
module.exports = (app, passport) => {

   app.route('/user/register')
      .post(user_controller.register);

   app.route('/user/verify/:token')
      .get(user_controller.verifyAccount);

   app.route('/user/login')
      .post(user_controller.login);

   app.route('/user/:id')
      .get(auth.authLogin,user_controller.getUser);

   app.route('/user/request/forgotpassword/:email')
      .get(user_controller.requestForgotPassword)

   app.route('/user/verify/forgotpassword')
      .post(user_controller.verifyForgotPassword)

   app.route('/user/forgotpassword')
      .post(user_controller.forgotPassword)

   app.route('/auth')
      .post(auth.verify)

   app.route('/user/updateinfor')
      .put(auth.authLogin, user_controller.updateInfor)

   app.route('/user/updatepassword')
      .put(auth.authLogin, user_controller.updatePassword)

   app.route('/auth/facebook')
      .get(passport.authenticate('facebook', {scope: ['email']}));
      
   app.route('/auth/facebook/callback')
      .get(passport.authenticate('facebook', {
          successRedirect: '/',
          failureRedirect: '/fail'
      })
  );

  app.route('/fail')
      .get(user_controller.fail);
      

}