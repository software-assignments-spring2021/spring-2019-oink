const mongoose = require('mongoose');
const User = mongoose.model("User");

function inSession(user){
	if(user)
		return true;
	else
		return false;
}

function addUser(req, cb){
	const img = {};
	img.src = '/images/no_profile_picture.png';
	img.contentType = '/image/png';
	img.rawSRC = __dirname + '/../public/images/no_profile_picture.png';
	user = {username: req.body.username, email: req.body.email, 'img': img, 'defaultTip': 20};

	if(user.email != ""){
		User.register(new User(user), req.body.password, function(err, user){
			if(err){
				console.log(err);
				//res.render('registration', {error: err.message});
				return cb({error: err.message});
				// If error, reload page with error message
			}
			else{
				return cb('/user/index');
			}
		});
	}
	else{
		//res.render('registration', {error: "No Email Provided"});
		return cb({error: "No Email Provided"});
	}
}

function getLogin(user){
	if(user)
		return '/user/index';
	else
		return 'Login';
}

function getTransactions(){
	
}

module.exports = {
	inSession: inSession,
	addUser: addUser,
	getLogin: getLogin
}