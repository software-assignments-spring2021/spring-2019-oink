const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");
const Friend = mongoose.model("Friend");

const BF = require('../public/js/BillFactory');

const dateTime = require('node-datetime');

const dbHelp = require('../helpers/db_helpers.js');
const valHelpers = require('../helpers/validation_helpers.js');
const cron = require("node-cron");

router.get('/testSchedule', (req, res) => {
	cron.schedule("* * * * * *", function() {
      	const friend = new Friend({
      		user: "Sam",
      		balance: 0
      	});
      	console.log(friend);
      	friend.save();
    });
    res.send("scheduled");
});

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
		// FIGURE OUT THE DATE
		const dt = dateTime.create();
		const formatted = dt.format('m/d/Y');

		let friendsToSplit = req.body.splitWith.split(','); friendsToSplit[friendsToSplit.length-1] = req.session.user.username;
		formattedBody = JSON.parse(JSON.stringify(req.body));
		const BillFactory = new BF.BillFactory(formattedBody);
		
		BillFactory.createBill(formatted, user, req.body.amount, friendsToSplit, req.body.comment, res);		
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
					User.findOne({"username": req.session.user.username}, (err, sessionUser) => {
						const friends = [];
						const nonfriends = [];
						for(let i = 0; i < transactions.length; i++){
							const user = transactions[i].paidBy;
							let isFriend = false;
							for(let j = 0; j < sessionUser.friends.length; j++){
								if(sessionUser.friends[j].user == user){
									isFriend = true;
									friends.push(transactions[i]);
								}
							}

							if(user == sessionUser.username)
								friends.push(transactions[i]);

							else if(!isFriend)
								nonfriends.push(transactions[i]);
						}
						console.log(friends);
						console.log(nonfriends);
						res.render('billSummary', {"amount": bill.amount, "username": bill.splitWith[bill.splitWith.length-1], 
						"date": bill._id.getTimestamp(), "text": bill.comment, "friend-transactions": friends, "non-friend-transactions": 
						nonfriends});
					});
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
