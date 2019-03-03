const chai = require('chai');
const expect = chai.expect; 
const app = require("../test_app.js");

describe('Oink Adding Tests', function(){
	// CHECK COLLISION FUNCTION TESTA
	describe('addFriend', function(){
		// DOES NOT ALLOW HEAD OF SNAKE TO EQUAL ANY PART OF THE SNAKE'S BODY
		it('returns true if Friend added correctly', function(){
			const friend = {};
			friend.username = "testName";
			friend.email = "test@email.com";
			const res = app.addFriend(friend.username);
			expect(res).to.be.true;
		});
	});

	describe('addGroup', function(){
		// DOES NOT ALLOW SNAKE TO EXCEED BOUNDS OF CANVAS FRAME
		it('returns true if group created successfully', function(){
			const friend1 = {username: "testName", email: "test@email.com"};
			const friend2 = {username: "testName2", email: "test2@email.com"};
			const friends = [friend1, friend2];
			const name = "friends";
			const res = app.addGroup(name, friends);
			expect(res).to.be.true;
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
});