const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const app = require("../src/public/js/server-side/group_helpers.js");
const User = mongoose.model("User");

describe('Group Tests', function(){
	describe('addGroup', function(){
		const user = new User({
			username: 'charlie',
			email: 'charlie',
			password: 'charlie'
		});
		it('returns error string if user does not exist', function(done){
			const fakeUser = {username: 'fakeUser'};
			app.addGroup(fakeUser, {}, function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns object with error if marked for error', function(done){
			user.save(function(err, newUser){
				const query = {error: 'error2'};
				app.addGroup(newUser, query, function(ret){
					expect(ret).to.include({error: "Group Name Taken"});
					done();
				});
			});
		});
		it('returns object without error if nothing wrong', function(done){
			user.save(function(err, newUser){
				app.addGroup(user, {}, function(ret){
					const bool = false;
					if(ret.hasOwnProperty('error'))
						bool = true;
					expect(bool).to.be.false;
					done();
				});
			});
		});
	});
});