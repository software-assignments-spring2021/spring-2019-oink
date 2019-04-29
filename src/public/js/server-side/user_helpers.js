const mongoose = require('mongoose');
const User = mongoose.model("User");

function inSession(user){
	if(user)
		return true;
	else
		return false;
}

module.exports = {
	inSession: inSession
}