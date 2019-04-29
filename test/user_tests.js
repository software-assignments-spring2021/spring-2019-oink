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
	describe('addUser', function(){
		it('returns error if username taken', function(done){
			const req = {};
			req.body = {username: 'david', email: 'david', password: 'david'}
			app.addUser(req, function(ret){
				const bool = ret.hasOwnProperty('error');
				expect(bool).to.be.true;
				done();
			});
		});
		it('returns error if no email given', function(done){
			const req = {};
			req.body = {username: 'david', email: '', password: 'david'}
			app.addUser(req, function(ret){
				expect(ret.error).to.equal("No Email Provided");
				done();
			});
		});
		it('returns redirect string if user created', function(done){
			const req = {};
			req.body = {username: 'newUser', email: 'newUser', password: 'newUser'}
			app.addUser(req, function(ret){
				expect(ret).to.equal("/user/index");
				done();
			});
		});
	});
	describe('getLogin', function(){
		it('redirects to user index if session in-place', function(done){
			const bool = app.getLogin(user);
			expect(bool).to.equal('/user/index');
			done();
		});
		it('renders login screen if no session', function(done){
			const bool = app.getLogin();
			expect(bool).to.equal("Login");
			done();
		})
	});
});
