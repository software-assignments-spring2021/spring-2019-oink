const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");
const Friend = mongoose.model("Friend");

const BF = require('../public/js/server-side/BillFactory');

const dateTime = require('node-datetime');

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
		// FIGURE OUT THE DATE
		const dt = dateTime.create();
		const formatted = dt.format('m/d/Y');

		let friendsToSplit = req.body.splitWith.split(','); friendsToSplit[friendsToSplit.length-1] = req.session.user.username;
		formattedBody = JSON.parse(JSON.stringify(req.body));
		const BillFactory = new BF.BillFactory(formattedBody);
		
		BillFactory.createBill(formatted, user, friendsToSplit, function(ret){
			if(ret == 'error')
				res.send('error');
			else
				res.redirect(ret);
		});		
	}

	else{
		res.redirect('/user/login');
	}

});

// Bill summary page displayed after creation of bill and viewable from user-profile page.
// Displays all relative fields of bill, including the created transactions, the amount,
// and the comment. 

router.get('/view/:id', (req, res) => {
	if(req.session.user){
		const id = req.params.id;
		BF.viewBill(id, req.session.user.username, function(ret){
			if(ret == 'error')
				res.send(ret);
			else
				res.render('billSummary', ret);
		});
	}
	else{
		res.redirect('/user/login');
	}
});

module.exports = router;
