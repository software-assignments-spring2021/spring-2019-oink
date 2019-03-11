const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");

router.get('/add', (req, res) => {
	res.send('home page for adding a bill');
	//res.render('addBill');
});

router.post('/add', (req, res)=>{
	//the bill gets amount and all the people it is being split with are passed to the server
	//the session user should get added to that list
	//the bill is added to the database and then gets split into transactions based on amount/weights
	//Bill: [{amount:90, splitWith:[user1, user2, user3]}]
	//transactions: [{amount: $30, paidBy:user1, bill:bill_id}, {amount: $25, paidBy:user2, bill:bill_id}, {amount: $35: paidBy: user3, bill:bill_id}]
	//The bill gets added to the user that added it, and the transactions

	console.log(req.body, req.session.user);
	const friendsToSplit = req.body.splitWith.split(','); friendsToSplit.push(req.session.user.username);
	const bill = {amount:req.body.amount, splitWith:friendsToSplit};
	console.log(bill);

	Bill.register(new Bill(bill))


	//req.session.user.bills.add(new Bill())


	res.send("");

});

// router.post('/add', (req, res) => {
// 	const a = {};
// 	if(req.query.searchUser !== "" && req.query.searchUser !== undefined){
// 		a.username = req.query.searchUser;
// 	}
// 	User.find(a, function(err, data){
// 		if(data === null){
// 			res.send('404 CANNOT RETRIEVE');
// 		}
// 		else{
// 			//res.render('reviews', {reviews: data});
// 			res.send(a.username + " found!");
// 		}
// 	});
// });

// router.post('/split', (req, res)=>{
// 	res.send('');
// });

module.exports = router;