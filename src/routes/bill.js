const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");

const dbHelp = require('../helpers/db_helpers.js');

/*
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
});*/

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
		let friendsToSplit = req.body.splitWith.split(','); friendsToSplit[friendsToSplit.length-1] = req.session.user.username;
		const bill = new Bill({
			amount:req.body.amount,
			splitWith:friendsToSplit,
			about:req.body.about
		});
		let id;
		bill.save((err, addedBill)=>{
			if (err){
				res.send("Error adding bill");
				console.log(err);
			}
			else{
				User.findOne({username: user.username}, (err, doc)=>{
					doc.bills.push(mongoose.Types.ObjectId(addedBill._id));
					id = addedBill._id;
					doc.save(function(){
						req.body = JSON.parse(JSON.stringify(req.body));
						friendsToSplit = [];
						for(let key in req.body){
							if(req.body.hasOwnProperty(key)){
								if(key !== "splitWith" && key !== "amount" && key !== "about"){
									const a = {}
									a.user = key;
									a.amount = req.body[key];
									friendsToSplit.unshift(a);
								}
							}
						}
						for(let i = 0; i < friendsToSplit.length; i ++){
							let transaction;
							if(i !== friendsToSplit.length-1){
								
								transaction = new Transaction({
									amount:friendsToSplit[i].amount,
									paidBy:friendsToSplit[i].user,
									paidTo:friendsToSplit[friendsToSplit.length-1].user,
									isPaid: false,
									//bill: mongoose.Types.ObjectId(id)
									bill: id
								});
							}
							else{ // ASSUMES USER CREATING BILL PAYS FOR IT
								transaction = new Transaction({
									amount:friendsToSplit[i].amount,
									paidBy:friendsToSplit[i].user,
									paidTo:friendsToSplit[friendsToSplit.length-1].user,
									isPaid: true,
									//bill: mongoose.Types.ObjectId(id)
									bill: id
								});
							}

							transaction.save((err, addedTransaction)=>{
								if (err){
									res.send("Error adding Transaction");
									console.log(err);
								}
								else{
									User.findOne({username: friendsToSplit[i].user}, (err, doc)=>{
										doc.transactions.push(mongoose.Types.ObjectId(addedTransaction._id));
										doc.save();
									});
								}
							});
						}
						/*
						User.findOne({"username": user.username}, (err, doc) => {
							const billId = doc.bills[doc.bills.length-1].toString();
							res.redirect(billId); // redirect to bill page
						});	*/
						res.redirect(id);
					});
				});
			}
		});

	}

	else{
		res.redirect('/user/login');
	}

});

router.get('/:id', (req, res) => {
	if(req.session.user){
		const id = req.params.id;
		Bill.findById(id, (err, bill)=>{
			if(!err){
				Transaction.find({"bill": id}, (err, transactions) => {
					res.render('billSummary', {"amount": bill.amount, "username": bill.splitWith[bill.splitWith.length-1], 
					"date": bill._id.getTimestamp(), "text": bill.about, "transactions": transactions});
				});
			}
			else{
				console.log(err);
				res.send('error');
			}
		});
	}
	else{
		res.redirect('/user/login');
	}
});

module.exports = router;