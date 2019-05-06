const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const app = require("../src/public/js/server-side/api_helpers.js");
const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");

describe('Oink API Router Tests', function(){

	const user = new User({
		username: "test",
		email: "test@test.com",
		password: "test",
		img: {src: "fakeImg"}
	});
	const user2 = new User({
		username: "testUser",
		email: "test2@test2.com",
		password: "testUser"
	});
	const fakeUser = new User({
		username: "fakeUser",
		email: "fake@fake.com",
		password: 'fake'
	});

	describe('addFriend', function(){
		it('returns true if friend created', function(done){
			user.save(function(){
				user2.save(function(){
					app.addFriend('testUser', user, function(bool){
						expect(bool).to.be.true;
						done();
					});
				});
			});
		});
		it('returns false if incorrect friend given', function(done){
			
			app.addFriend('fakeUser', fakeUser, function(bool){
				expect(bool).to.be.false;
				done();
			});
		});

	});

	describe('isFriend', function(){
		it('returns true if friends', function(done){
			app.isFriend('testUser', user, function(bool){
				expect(bool).to.be.true;
				done();
			});
		});
		it('returns false if incorrect name', function(done){
			app.addFriend('fakeUser', fakeUser, function(bool){
				expect(bool).to.be.false;
				done();
			});
		});
	});
	
	describe('getImage', function(){
		it('returns error if username incorrect', function(done){
			app.getImage('fakeUser', function(res){
				expect(res).to.equal('error');
				done();
			});
		});
		it('returns true if correct name', function(done){
			app.getImage('test', function(res){
				expect(res).to.equal('fakeImg');
				done();
			});
		});
	});
	
	describe('getHistory', function(){
		it('returns response object if usernames correct', function(done){
			app.getHistory('testUser', user, function(res){
				expect(res).to.include({balance: 0});
				done();
			});
		});
		it('returns undefined if incorrect name', function(done){
			app.getHistory('fakeUser', user, function(res){
				expect(res).to.equal(undefined);
				done();
			});
		});
	});

	describe('removeTransaction', function(){
		const transaction = new Transaction({
			amount: 5,
			paidBy: "testUser",
			paidTo: "test",
			dateCreated: "5/2/19"
		});
		it('returns false if no transaction found', function(done){
			app.removeTransaction('fakeTransaction', function(res){
				expect(res).to.equal('error');
				done();
			});
		});
		it('returns response string if transaction deleted', function(done){
			transaction.save(function(err, doc){
				app.removeTransaction(doc._id, function(res){
					expect(res).to.equal('document removed');
					done();
				});
			});
		});
	});

	describe('changeTip', function(){
		it('returns response string if correct tip and user given', function(done){
			app.changeTip('5', 'testUser', function(res){
				expect(res).to.equal('Tip Changed');
				done();
			});
		});
		it('returns error if incorrect tip', function(done){
			app.changeTip('aslkdf', 'testUser', function(res){
				expect(res).to.equal('Error');
				done();
			});
		});
	});

});