const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");

const dbHelp = require('../helpers/db_helpers.js');

const async = require('async');

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
					doc.save((err, saved)=> dbHelp.saveDocAndRedirect(err, saved, res, `/bill/created`));
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
								const usr = bill.splitWith[i];
								sharees.push(usr);
							}
							
							res.render('billCreated', {"value": value, "splitWith": sharees, "bill": id});
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

router.post('/created', (req, res) => {
	req.body = JSON.parse(JSON.stringify(req.body));
	if(req.session.user){
		const friendsToSplit = [];
		for(let key in req.body){
			if(req.body.hasOwnProperty(key)){
				const a = {}
				a.user = key;
				a.amount = req.body[key];
				friendsToSplit.push(a);
			}
		}
		const id = req.session.user.bills[req.session.user.bills.length-1];
		
		for(let i = 0; i < friendsToSplit.length; i ++){
			//console.log(friendsToSplit[i].user);
			let transaction;
			if(i != friendsToSplit.length-1){
				transaction = new Transaction({
				amount:friendsToSplit[i].amount,
				paidBy:friendsToSplit[i].user,
				paidTo:friendsToSplit[friendsToSplit.length-1].user,
				isPaid: false,
				bill: id
				});
			}
			else{ // ASSUMES USER CREATING BILL PAYS FOR IT
				transaction = new Transaction({
				amount:friendsToSplit[i].amount,
				paidBy:friendsToSplit[i].user,
				paidTo:friendsToSplit[friendsToSplit.length-1].user,
				isPaid: true,
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
						doc.transactions.push(addedTransaction._id);
						doc.save();
					});
				}
			})
		}
		res.redirect('/user/'+ req.session.user.username);
	}
	else{
		res.redirect('/user/login');
	}
});

router.get('/view/:id', (req, res)=>{
	//view one bill

	if(req.session.user){

		Bill.findOne({"_id" :req.params.id}, (err, bill)=>{
			if (err || !bill){
				res.render("viewBill",{err:"bill not found"});
			}
			else{
				console.log(bill);

				//find all transactions that go along with the bill
				Transaction.find({'bill':bill._id}, (err, transactions)=>{

					if(err){
						bill['transactions'] = []
					}
					else{
						bill['transactions'] = transactions
					}

					res.render('viewBill', {'bill':bill})

				});

			}


		});
	}
	else{
		res.redirect('/user/login');
	}

});

module.exports = router;