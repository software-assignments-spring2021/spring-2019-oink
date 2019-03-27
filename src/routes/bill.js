const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");

const dbHelp = require('../helpers/db_helpers.js');

router.get('/add', (req, res) => {

	// Search bar will display the names of every friend on session user's friend-list
	// Filtering will be implemented using client-side JS

	// SPRINT 1 VERSION
		// DISPLAY ALL USERS IN OINK DATABASE

		// WILL EVENTUALLY ONLY SHOW FRIENDS OF USER
	
	if(req.session.user){
		//const users = req.session.user.friends;
		User.find({}, function(err, users, count){
			if(users != null){
				res.render('addbill', {'friends': users});
			}
			else{
				res.send('No Users Yet');
			}
		});
	}
	else{
		res.redirect('/user/login');
	}

});

router.post('/add', (req, res)=>{
	//the bill gets amount and all the people it is being split with are passed to the server
	//the session user should get added to that list
	//the bill is added to the database and then gets split into transactions based on amount/weights
	//Bill: [{amount:90, splitWith:[user1, user2, user3]}]
	//transactions: [{amount: $30, paidBy:user1, bill:bill_id}, {amount: $25, paidBy:user2, bill:bill_id}, {amount: $35: paidBy: user3, bill:bill_id}]
	//The bill gets added to the user that added it, and the transactions get added to each user by username

	//always want to add the bill to the session user, the can choose to split it among other users by using usernames

	let user = req.session.user;
	if(user){
		const friendsToSplit = req.body.splitWith.split(','); friendsToSplit.push(req.session.user.username);
		const bill = new Bill({
			amount:req.body.amount,
			splitWith:friendsToSplit});

		bill.save((err, addedBill)=>{
			if (err){
				res.send("Error adding bill");
				console.log(err);
			}
			else{
				console.log("need to split bill into transactions");

				User.findOne({username: user.username}, (err, doc)=>{
					doc.bills.push(addedBill._id);
					doc.save((err, saved)=> dbHelp.saveDocAndRedirect(err, saved, res, `/created`));
				});
			}
		})


	}

	else{
		res.redirect('/user/login');
	}

});

router.get('/created', (req, res) => {
	if(req.session.user){
		const username = req.session.user.username;
		User.findOne({"username": username}, (err, user) => {
			if(user){
				if(user.bills.length == 0){
					res.send("No Bills Created Yet :(");
				}
				else{
					const id = user.bills[user.bills.length-1];
					Bill.findById(id, (err, bill)=>{
						if(!err){
							const value = bill.amount;
							const sharees = [];
							for(let i = 0; i < bill.splitWith.length; i++){
								const usr = {};
								usr.name = bill.splitWith[i];
								usr.split = value / bill.splitWith.length;
								sharees.push(usr);
							}
							res.render('billCreated', {"value": value, "splitWith": sharees});
						}
						else{
							res.send('error');
						}
					});
				}
			}
			else{
				res.send('error');
			}
		});
	}
	else{
		res.redirect('/user/login');
	}
});

module.exports = router;