const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const User = mongoose.model("User");

const app = require("../src/public/js/server-side/user_helpers");

describe('User Tests', function(){
	const user = new User({
		username: 'david',
		password: 'david',
		email: 'david'
	});
	describe('inSession', function(){
		it('returns true if session user exists', function(done){
			user.save(function(){
				const ret = app.inSession(user);
				expect(ret).to.be.true;
				done();
			});
		});
		it('returns false if session user does not exist', function(done){
			user.save(function(){
				const ret = app.inSession();
				expect(ret).to.be.false;
				done();
			});
		});
	});
});
