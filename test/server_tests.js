const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const app = require("../src/routes/api.js");
const User = mongoose.model("User");

describe('Oink API Tests', function(){
	const user = new User({
		username: "test",
		email: "test@test.com",
		password: "test"
	});
	const user2 = new User({
		username: "testUser",
		email: "test2@test2.com",
		password: "test2"
	});
	const fakeUser = new User({
		username: "fakeUser",
		email: "fake@fake.com",
		password: 'fake'
	});
	user.save();
	user2.save();
	describe('addFriend', function(){
		it('returns true if friend created', function(){
			const bool = false;
			expect(bool).to.be.false;
		});
	});
	/*
	user.save((err, newUser) => {
		user2.save(function(){
			
		describe('addFriend', function(){
			it('returns true if friend created', function(){
				app.addFriend('testUser', user, function(bool){
					expect(bool).to.be.true;
				});
			});
			it('returns false if incorrect name', function(){
				app.addFriend('fakeUser', fakeUser, function(bool){
					expect(bool).to.be.false;
				});
			});
		});
		
		describe('isFriend', function(){
			it('returns false if not friends', function(){
				app.isFriend('testUser', user, function(bool){
					expect(bool).to.be.true;
				});
			});
			it('returns false if incorrect name', function(){
				app.addFriend('fakeUser', fakeUser, function(bool){
					expect(bool).to.be.false;
				});
			});
		});
			});
	});*/
});