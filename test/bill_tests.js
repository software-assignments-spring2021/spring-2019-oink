const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const app = require("../src/public/js/server-side/BillFactory");
const User = mongoose.model("User");
const Bill = mongoose.model("Bill");

describe('Bill Router Tests', function(){
	describe('isError', function(){
		it('returns true if unparseable string inputted as amount', function(done){
			const reqBody = {amount: "alskdfjasldf"};
			expect(app.isError(reqBody)).to.be.true;
			done();
		});
		it('returns true if amount is 0', function(done){
			const reqBody = {amount: 0};
			expect(app.isError(reqBody)).to.be.true;
			done();
		});
		it('returns true if any transaction is unparseable', function(done){
			const reqBody = {amount: 50, alice: "unparseable"};
			expect(app.isError(reqBody)).to.be.true;
			done();
		});
		it('returns false if no errors', function(done){
			const reqBody = {amount: 50, alice: 50};
			expect(app.isError(reqBody)).to.be.false;
			done();
		});
	});
	describe('correctMembersLength', function(){
		it('returns true if only one member of bill', function(done){
			const reqBody = {alice: 50};
			expect(app.correctMembersLength(reqBody)).to.be.true;
			done();
		});
		it('returns false if more than one member of bill', function(done){
			const reqBody = {alice: 50, bill: 50};
			expect(app.correctMembersLength(reqBody)).to.be.false;
			done();
		});
	});
	describe('countTotals', function(){
		it('returns true if percentages do not equal 100', function(done){
			const reqBody = {typeOfPayment: '%', alice: 99};
			expect(app.countTotals(reqBody)).to.be.true;
			done();
		});
		it('returns true if values do not equal to bill amount', function(done){
			const reqBody = {typeOfPayment: '$', amount: 100, alice: 99};
			expect(app.countTotals(reqBody)).to.be.true;
			done();
		});
		it('returns false if everything is correct', function(done){
			const reqBody = {typeOfPayment: '$', amount: 100, alice: 100};
			expect(app.countTotals(reqBody)).to.be.false;
			done();
		});
	});
	describe('billFactory', function(){
		const alice = new User({
			username: 'alice',
			password: 'alice',
			email: 'alice',
			friends: [{user: 'bob', balance: 0}]
		});
		const bob = new User({
			username: 'bob',
			password: 'bob',
			email: 'bob',
			friends: [{user: 'alice', balance: 0}]
		});
		const date = '/1/2/03';
		const user = 'alice';
		const friendsToSplit = ['alice', 'bob'];
		it('returns redirect string if only one member of bill', function(done){
			const body = {comment: 'test', pretip: '100', tip: '0',
				typeOfPayment: '%', amount: '100', alice: '100'};
			const billFactory = new app.BillFactory(body);
			billFactory.createBill(date, user, friendsToSplit, function(ret){
				expect(ret).to.equal('/user/index?error=error1');
				done();
			});
		});
		it('returns redirect string if totals do not add up correctly', function(done){
			const body = {comment: 'test', pretip: '100', tip: '0',
				typeOfPayment: '%', amount: '100', alice: '90', bob: '5'};
			const billFactory = new app.BillFactory(body);
			billFactory.createBill(date, user, friendsToSplit, function(ret){
				expect(ret).to.equal('/user/index?error=error2');
				done();
			});
		});
		it('returns redirect string if any other error', function(done){
			const body = {comment: 'test', pretip: '100', tip: '0',
				typeOfPayment: '%', amount: 'alskdf', alice: '90', bob: '10'};
			const billFactory = new app.BillFactory(body);
			billFactory.createBill(date, user, friendsToSplit, function(ret){
				expect(ret).to.equal('/user/index?error=error3');
				done();
			});
		});
		it('returns redirect string if any other error', function(done){
			const body = {comment: 'test', pretip: '100', tip: '0',
				typeOfPayment: '%', amount: 'alskdf', alice: '90', bob: '10'};
			const billFactory = new app.BillFactory(body);
			billFactory.createBill(date, user, friendsToSplit, function(ret){
				expect(ret).to.equal('/user/index?error=error3');
				done();
			});
		});
		it('returns redirect bill summary page if everything correct', function(done){
			alice.save(function(err, user){
				bob.save(function(){
					const body = {comment: 'test', pretip: '100', tip: '0',
						typeOfPayment: '%', amount: '100', alice: '90', bob: '10'};
					const billFactory = new app.BillFactory(body);
					billFactory.createBill(date, user, friendsToSplit, function(ret){
						expect(ret.substring(0, 11)).to.equal('/bill/view/');
						done();
					});
				});
			});
		});
	});
	describe('viewBill', function(){
		const bill = new Bill({
			amount: 50,
			splitWith: ['alice', 'bob'],
			dateCreated: '1/2/3'
		});
		it('returns false if bill does not exist', function(done){
			app.viewBill('fakeBill', 'alice', function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns object if bill does exist', function(done){
			bill.save(function(err, newBill){
				app.viewBill(newBill._id, 'alice', function(ret){
					expect(ret).to.include({amount: 50});
					done();
				});
			});
		});
	});
});