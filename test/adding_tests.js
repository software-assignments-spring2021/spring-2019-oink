const chai = require('chai');
const expect = chai.expect; 
const app = require("app.js");

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
});