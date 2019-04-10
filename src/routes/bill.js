const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");
const Friend = mongoose.model("Friend");

const dbHelp = require('../helpers/db_helpers.js');
const valHelpers = require('../helpers/validation_helpers.js');


router.post('/add', (req, res)=>{
	console.log(req.body);
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
			comment:req.body.comment
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
								if(key !== "splitWith" && key !== "amount" && key !== "about" && key !== 'pretip' && key !== 'tip'){
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
									console.log(err);
									res.send("Error adding Transaction");
									
								}
								else{
									User.findOne({username: friendsToSplit[i].user}, (err, doc)=>{
										doc.transactions.push(mongoose.Types.ObjectId(addedTransaction._id));
										doc.save();
									});
								}
							});
						}

						// SEE IF ANY USERS ARE FRIENDS OF BILL CREATOR
							// IF YES, UPDATE BALANCES

						for(let i = 0; i < friendsToSplit.length-1; i++){
							const friendName = friendsToSplit[i].user;
							const updateBalance = friendsToSplit[i].amount; // negative of amount to pay

							User.findOne({"username": req.session.user.username}, (err, sessionUser) => {
								for(let j = 0; j < sessionUser.friends.length; j++){
									const friend = sessionUser.friends[j];
									if(friend.user == friendName){
										friend.balance -= updateBalance;
										sessionUser.markModified('friends');
										sessionUser.save();
									}
								}
							});
						}

						res.redirect(`/bill/view/${id}`);
					});
				});
			}
		});		
	}

	else{
		res.redirect('/user/login');
	}

});

router.get('/view/:id', (req, res) => {
	if(req.session.user){
		const id = req.params.id;
		Bill.findById(id, (err, bill)=>{
			if(!err){
				Transaction.find({"bill": id}, (err, transactions) => {
					res.render('billSummary', {"amount": bill.amount, "username": bill.splitWith[bill.splitWith.length-1], 
					"date": bill._id.getTimestamp(), "text": bill.comment, "transactions": transactions});
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
