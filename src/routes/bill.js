const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");

router.get('/add', (req, res) => {
<<<<<<< HEAD
	res.send('home page for adding a bill');
	//res.render('addBill');
=======
	// Search bar will display the names of every friend on session user's friend-list
	// Filtering will be implemented using client-side JS
	if(req.session.user){
		const friends = req.session.user.friends;
		res.send('home page for adding a bill');
		//res.render('addBill', {'friends': friends});
	}
	else{
		res.redirect('/login');
	}
>>>>>>> c084d77c0cbf9169de6e2861659460c1abaeaf8a
});

router.post('/add', (req, res)=>{
	//the bill gets amount and all the people it is being split with are passed to the server
	//the session user should get added to that list
	//the bill is added to the database and then gets split into transactions based on amount/weights
	//Bill: [{amount:90, splitWith:[user1, user2, user3]}]
	//transactions: [{amount: $30, paidBy:user1, bill:bill_id}, {amount: $25, paidBy:user2, bill:bill_id}, {amount: $35: paidBy: user3, bill:bill_id}]
	//The bill gets added to the user that added it, and the transactions

<<<<<<< HEAD
	console.log(req.body, req.session.user);
	const friendsToSplit = req.body.splitWith.split(','); friendsToSplit.push(req.session.user.username);
	const bill = {amount:req.body.amount, splitWith:friendsToSplit};
	console.log(bill);

	Bill.register(new Bill(bill))


	//req.session.user.bills.add(new Bill())


	res.send("");
=======
	//always want to add the bill to the session user, the can choose to split it among other users by using usernames

	if(req.session.user){
		console.log(req.body, req.session.user);
		const friendsToSplit = req.body.splitWith.split(','); friendsToSplit.push(req.session.user.username);
		const bill = {amount:req.body.amount, splitWith:friendsToSplit, numOfSplits:friendsToSplit.length};
		console.log(bill);

		//req.session.user.bills.add(new Bill())


		res.send("");
	}

	else{
		res.redirect('/login');
	}
>>>>>>> c084d77c0cbf9169de6e2861659460c1abaeaf8a

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