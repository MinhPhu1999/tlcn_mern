require('dotenv').config();
// load những thứ chúng ta cần
const FacebookStrategy = require('passport-facebook').Strategy;
// load  user model
const User = require('./api/models/user.model');

module.exports = function (passport) {

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

	passport.use(new FacebookStrategy({
		// điền thông tin để xác thực với Facebook.
		clientID: process.env.FACEBOOK_API_KEY,
		clientSecret: process.env.FACEBOOK_API_SECRECT,
		callbackURL: process.env.CALLBACK_URL,
		profileFields: ['id','displayName','email','first_name','last_name','middle_name']
	},
	// Facebook sẽ gửi lại chuối token và thông tin profile của user
	function (token, refreshToken, profile, done) {
		// asynchronous
		process.nextTick(function () {
			// tìm trong db xem có user nào đã sử dụng facebook id này chưa
			User.findOne({'fbId': profile.id}, function (err, user) {
				if (err)
					return done(err);
				// Nếu tìm thấy user, cho họ đăng nhập
				if (user) {
					return done(null, user); // user found, return that user
				} else {
					// nếu chưa có, tạo mới user
					var newUser = new User();
					// lưu các thông tin cho user
					fbId = profile.id;
					token = token;
					name = profile.name.givenName + ' ' + profile.name.familyName; // bạn có thể log đối tượng profile để xem cấu trúc
					fbEmail = profile.emails[0].value; // fb có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
					// lưu vào db
					newUser.save(function (err) {
						if (err)
							throw err;
						// nếu thành công, trả lại user
						return done(null, newUser);
					});
				}
			});
		});
	}));

};