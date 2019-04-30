const chai = require('chai');
const expect = chai.expect; 

const mongoose = require('mongoose');
require('../src/schemas');
const app = require("../src/public/js/server-side/group_helpers.js");
const User = mongoose.model("User");
const Group = mongoose.model("Group");

describe('Group Tests', function(){
	const user = new User({
		username: 'charlie',
		email: 'charlie',
		password: 'charlie'
	});
	const group = new Group({
		name: 'taken',
	});
	const secondGroup = new Group({
		name: 'test',
		inGroup: ['alice', 'bob', 'charlie'],
		administrator: 'charlie'
	});
	const thirdGroup = new Group({
		name: 'testGroup',
		inGroup: ['alice', 'charlie'],
		administrator: 'alice'
	});
	const fourthGroup = new Group({
		name: 'testGroup2',
		inGroup: [],
		administrator: 'alice'
	});
	describe('handleGroupError', function(){
		it('returns error string if user does not exist', function(done){
			const fakeUser = {username: 'fakeUser'};
			app.handleGroupError(fakeUser, {}, function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns object with error if marked for error', function(done){
			user.save(function(err, newUser){
				const query = {error: 'error2'};
				app.handleGroupError(newUser, query, function(ret){
					expect(ret).to.include({error: "Group Name Taken"});
					done();
				});
			});
		});
		it('returns object without error if nothing wrong', function(done){
			user.save(function(err, newUser){
				app.handleGroupError(user, {}, function(ret){
					const bool = false;
					if(ret.hasOwnProperty('error'))
						bool = true;
					expect(bool).to.be.false;
					done();
				});
			});
		});
	});
	describe('addGroup', function(){
		it('returns error string if only one group member', function(done){
			const req = {};
			req.body = {name: 'newGroup', splitWith: ''};
			app.addGroup(user, req, function(ret){
				expect(ret).to.equal('add?error=error3');
				done();
			});
		});
		it('returns error string if no name provided', function(done){
			const req = {};
			req.body = {name: '', splitWith: 'alice'};
			app.addGroup(user, req, function(ret){
				expect(ret).to.equal('add?error=error');
				done();
			});
		});
		it('returns error string if group name taken', function(done){
			group.save(function(){
					const req = {};
					req.body = {name: 'taken', splitWith: 'alice'};
					app.addGroup(user, req, function(ret){
					expect(ret).to.equal('add?error=error2');
					done();
				});
			});
		});
		it('redirects to group page if everything correct', function(done){
			const req = {};
			req.body = {name: 'unique', splitWith: 'alice,'};
			app.addGroup(user, req, function(ret){
				ret = ret.substring(ret.length-4, ret.length);
				expect(ret).to.equal('true');
				done();
			});
		});
	});
	describe('deleteGroup', function(){
		it('returns error if group does not exist', function(done){
			app.deleteGroup('fakeID', function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns message if group deleted', function(done){
			app.deleteGroup(group._id, function(ret){
				expect(ret).to.equal('group removed');
				done();
			});
		});
	});
	describe('removeMember', function(){
		it('returns error if group does not exist', function(done){
			const req = {};
			req.body = {member: 'alice', group: 'fakeGroup'};
			app.removeMember(req, function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns error if user does not exist', function(done){
			secondGroup.save(function(){
				const req = {};
				req.body = {member: 'fakeUser', group: secondGroup._id};
				app.removeMember(req, function(ret){
					expect(ret).to.equal('error');
					done();
				});
			});
		});
		it('removes member if user and group exist', function(done){
			secondGroup.save(function(){
				const req = {};
				req.body = {member: 'alice', group: secondGroup._id};
				app.removeMember(req, function(ret){
					expect(ret).to.equal('member removed');
					done();
				});
			});
		});
	});
	describe('addMember', function(){
		it('returns true if group and user exist', function(done){
			const req = {};
			req.body = {member: 'charlie', group: secondGroup._id};
			app.addMember(req, function(ret){
				expect(ret).to.equal('member added');
				done();
			});
		});
	});
	describe('getGroup', function(){
		it('returns error if group does not exist', function(done){
			app.getGroup('41224d776a326fb40f000001', function(ret){
				expect(ret).to.equal('error');
				done();
			});
		});
		it('returns group if group does exist', function(done){
			app.getGroup(secondGroup._id, function(ret){
				expect(typeof ret).to.equal('object');
				done();
			});
		});
	});
	describe('groupProfile', function(){
		it('returns redirect string if group does not exist', function(done){
			app.groupProfile('41224d776a326fb40f000001', user, false, function(ret){
				expect(ret).to.equal('/user/index');
				done();
			});
		});
		it('returns redirect string if session user not the admin', function(done){
			thirdGroup.save(function(){
				app.groupProfile(thirdGroup._id, user, true, function(ret){
					expect(ret).to.equal('id?isAdmin=false');
					done();
				});
			});
		});
		it('returns group if session user is the admin', function(done){
			app.groupProfile(secondGroup._id, user, true, function(ret){
				const bool = ret.hasOwnProperty('group');
				expect(bool).to.be.true;
				done();
			});
		});
		it('returns group and user if session user not the admin', function(done){
			app.groupProfile(thirdGroup._id, user, false, function(ret){
				const bool = ret.hasOwnProperty('user');
				expect(bool).to.be.true;
				done();
			});
		});
		it('returns group and noMembers boolean if group is empty', function(done){
			fourthGroup.save(function(){
					app.groupProfile(fourthGroup._id, user, false, function(ret){
					const bool = ret.hasOwnProperty('noMembers');
					expect(bool).to.be.true;
					done();
				});
			});
		});
	});
});