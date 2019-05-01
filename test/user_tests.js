const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");
const Group = mongoose.model("Group");
const Bill = mongoose.model("Bill");

const app = require("../src/public/js/server-side/user_helpers");

describe('User Tests', function(){
	const transaction = new Transaction({
		amount: 15,
		paidTo: 'alice',
		paidBy: 'david',
		isPaid: false
	});
	const unpaidTransaction = new Transaction({
		amount: 10,
		paidTo: 'alice',
		paidBy: 'david',
		isPaid: false
	});
	const secondUser = new User({
		username: 'earl',
		password: 'earl',
		email: 'earl',
		transactions: [transaction._id]
	});
	const group = new Group({
		name: 'davidGroup'
	});
	const bill = new Bill({
		amount: 50,
		splitWith: ['david'],
		dateCreated: '1/2/03'
	});
	const user = new User({
		username: 'david',
		password: 'david',
		email: 'david',
		transactions: [unpaidTransaction._id],
		bills: [bill._id],
		groups: [group._id]
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
	describe('getTransactions', function(){
		it('returns paid and unpaid transactions', function(done){
			app.getTransactions(user, function(ret){
				const paid = ret.hasOwnProperty('paid');
				const unpaid = ret.hasOwnProperty('unpaid');
				expect(paid && unpaid).to.be.true;
				done();
			});
		});
	});
	describe('payTransaction', function(){
		it('returns ok if transaction updated', function(done){
			transaction.save(function(){
				app.payTransaction(transaction._id, function(ret){
					expect(ret).to.equal("ok");
					done();
				});
			});
		});
		it('returns error if transaction does not exist', function(done){
			app.payTransaction('41224d776a326fb40f000001', function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
	});
	describe('getIndex', function(){
		it('returns object with notification if unpaid transaction', function(done){
			unpaidTransaction.save(function(){
				const req = {};
				req.query = {};
				app.getIndex(user, req, function(ret){
					expect(ret.hasOwnProperty('notification')).to.be.true;
					done();
				});
			});
		});
		it('returns object with no notification if paid transaction', function(done){
			secondUser.save(function(){
				const req = {};
				req.query = {};
				app.getIndex(secondUser, req, function(ret){
					expect(ret.hasOwnProperty('notification')).to.be.false;
					done();
				});
			});
		});
		it('returns object with error message if error but no notification', function(done){
			const req = {};
			req.query = {};
			req.query.error = "error";
			app.getIndex(secondUser, req, function(ret){
				expect(ret.hasOwnProperty('notification') && ret.hasOwnProperty('error')).to.be.false;
				done();
			});
		});
		it('returns object with error message if error and notification', function(done){
			const req = {};
			req.query = {};
			req.query.error = "error";
			app.getIndex(user, req, function(ret){
				expect(ret.hasOwnProperty('notification') && ret.hasOwnProperty('error')).to.be.true;
				done();
			});
		});
	});
	describe('myBills', function(){
		it('returns object with all user bills', function(done){
			app.myBills('david', function(ret){
				expect(ret.hasOwnProperty('bills')).to.be.true;
				done();
			});
		});
		it('returns error if user not found', function(done){
			app.myBills('fakeUser', function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
	});
	describe('myBalances', function(){
		it('returns object with all user friends', function(done){
			app.myBalances(user, function(ret){
				expect(ret.hasOwnProperty('friends')).to.be.true;
				done();
			});
		});
		it('returns error if user does not exist', function(done){
			const fakeUser = {username: 'fakeUser'};
			app.myBalances(fakeUser, function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
	});
	describe('getAllUsers', function(){
		it('returns all users besides requested ones', function(done){
			app.getAllUsers(['david'], function(ret){
				expect(ret.length > 1).to.be.true;
				done();
			});
		});
	});
	describe('getUserProfile', function(){
		it('redirects if user does not exist', function(done){
			group.save(function(){
				bill.save(function(){
					app.getUserProfile({}, 'fakeUser', user, function(ret){
						expect(ret).to.equal('/user/index');
						done();	
					});
				});
			});
		});
		it('renders session profile if requested user is in session', function(done){
			const req = {};
			req.query = {};
			app.getUserProfile(req, 'david', user, function(ret){
				expect(ret.hasOwnProperty('tip')).to.be.true;
				done();	
			});
		});
		it('renders normal profile if requested user not in session', function(done){
			app.getUserProfile({}, 'alice', user, function(ret){
				expect(ret.hasOwnProperty('tip')).to.be.false;
				done();	
			});
		});
	});
});
