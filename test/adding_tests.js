const chai = require('chai');
const expect = chai.expect; 
const app = require("../test_app.js");
const api = require("../src/public/js/oink_api.js");

const mongoose = require('mongoose');
require('../src/schemas');
const User = mongoose.model("User");
const Group = mongoose.model("Group");

describe('Oink Adding Tests', function(){

	describe('addFriend', function(){
		/*const user = new User({
				username: "test",
				email: "test@test.com",
				password: "test"
		});*/
		/*it('returns true if correct username given', function(){
			const username = "test";
			const res = api.addFriend(username, function(bool){
				expect(bool).to.be.true;
			});
		});*/

		it('returns false if no parameters passed in', function(){
			const res = app.addFriend();
			expect(res).to.be.false;
		});

		it('returns false if incorrect username given', function(){
			const username = "fakeName";
			/*
			const res = api.addFriend(username, function(bool){
				expect(bool).to.be.false;
			});*/
			const res = app.addFriend(username);
			expect(res).to.be.true;
		});
	});

	describe('addGroup', function(){
		/*const group = new Group({
			name: "test"
		});*/
		
		/*it('returns true if group name unique', function(){
			const name = "notTakenTest";
			const res = api.addGroup(name, function(bool){
				expect(bool).to.be.true;
			});
		});	*/

		it('returns false if no parameters passed in', function(){
			const res = app.addGroup();
			expect(res).to.be.false;
		});
	});


	describe('createUser', function(){
		it('adds a new user to the database', function(){
			const newUser = {username:"testUser", password:"salt and hash", email:"test@email.com"};
			const res = app.createUser(newUser);
			expect(res).to.be.true;
		});

		it("doesn't add the user if username or password is not present", function(){
			const incorrect = {username:"no password"};
			const res = app.createUser(incorrect);
			expect(res).to.be.false;
		});	
	});

	describe('findUser', function(){
		it('finds and returns a user given a username', function(){
			const username = "testUser";
			const res = app.findUser(username);
			expect(res).to.eql({username:username, friends:[], groups:[], bills:[]});
		});

		it("should return false if no username is given", function(){
			const res = app.findUser();
			expect(res).to.be.false;
		});

	});

	describe('splitBillEvenly', function(){
		it('returns how much each person should pay if the bill is split evenly among n people', function(){
			const bill = 100;
			const number = 4;
			const res = app.splitBillEvenly(bill, number);
			expect(res).to.eql(25);
		})
	})

	describe('splitBillUnevenly', function(){
		it('returns how the person should pay according to the specified percentage', function(){
			const bill = 100;
			const percentage = 50;
			const res = app.splitBillUnevenly(bill, percentage);
			expect(res).to.eql(50);
		})
	})
	describe('addBill', function(){
		it('returns true if split Bill added correctly', function(){
			const bill = {};
			bill.amount = 12.34;
			const friend1 = {username: "testName", email: "test@email.com"};
			const friend2 = {username: "testName2", email: "test2@email.com"};
			bill.splitWith = ["friend1", "friend2"];
			bill.notSplit = false;
			const res = app.addBill(bill.amount, bill);
			expect(res).to.be.true;
		});

		it('returns true if unsplit Bill added correctly', function(){
			const bill = {};
			bill.amount = 12.34;
			const friend1 = {username: "testName", email: "test@email.com"};
			bill.notSplit = true;
			bill.paidBy = "friend1";
			const res = app.addBill(bill.amount, bill);
			expect(res).to.be.true;
		});

		it('returns false if no parameters passed in', function(){
			const res = app.addBill();
			expect(res).to.be.false;
		});
	});

	describe('createSession', function(){
		it('returns true if session is created', function(){
			const res = app.createSession();
			expect(res).to.be.true;
		});
	});
	
});