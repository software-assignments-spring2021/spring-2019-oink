const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const fs = require('fs');
const formidable = require('formidable');
const async = require('async');

router.post('/add-friend',(req,res)=>{
	const username = req.body.username; //username of the friend being added

	const newFriend = new Friend({
		user: username,
		balance: 0.00
	});
	const secondFriend = new Friend({
		user: req.session.user.username,
		balance: 0.00
	});

	
	User.findOne({"username": req.session.user.username},(err, doc)=>{
		doc.friends.push(newFriend);
		doc.save((err,saved)=>{
			if(err){
				console.log(err);
				res.send({result: "error"});
			}
			else{
				//add the friend so it's immediatly accessible
				console.log(doc)
				//req.session.user.friends.push(newFriend);
				User.findOne({"username": username},(err, user)=>{
					user.friends.push(secondFriend);
					
					user.save();
					console.log(req.session.user);
					res.send({result: "added"});
					
					
				});
			}
		});
	});
});

// Used to determine whether a given username is friends
// with the session user. Used for AJAX requests
// meant to determine if an "Add Friend" button is needed
// next to a given username
router.post('/is-friend', (req, res) => {
	const username = req.body.username;
	const user = req.session.user;
	User.findOne({"username": user.username}, (err, sessionUser) => {
		let friends = false;
		for(let i = 0;i < sessionUser.friends.length; i++){

			if(sessionUser.friends[i].user == username)
				friends = true;
		}
		if(friends){
			res.send("friends");
		}
		else{
			res.send("not_friends");
		}
	});
});

router.post('/upload/image', (req, res) => {
	User.findOne({"username": req.session.user.username}, (err,sessionUser) => {
		console.log(sessionUser);
		//fs.unlinkSync(sessionUser.img.rawSRC);
		
		const form = new formidable.IncomingForm();

	    form.parse(req);

	    form.on('fileBegin', function (name, file){
	        file.path = __dirname + '/../public/images/' + file.name;
	    });

	    form.on('file', function (name, file){
	        console.log('Uploaded ' + file.name);
	        sessionUser.img.rawSRC = __dirname + '/../public/images/' + file.name;
			sessionUser.img.src = '/images/' + file.name;
			sessionUser.save(() => {
				res.redirect('/user/'+req.session.user.username);
			});
	    });		

	});
});

router.post('/image', (req, res) => {
	const username = req.body.username;
	User.findOne({"username": username}, (err, user) => {
		if(user)
			res.send(user.img.src);
		else
			res.send("error");
	});
});

router.post('/history', (req, res) => {
	const username = req.body.username;
	const sessionUser = req.session.user;
	Transaction.find({}, (err, transactions) => {
		const response = {};
		const relTransactions = [];
		const dates = [];
		for(let i = 0; i < transactions.length; i++){
			if(transactions[i].paidBy == sessionUser.username && transactions[i].paidTo == username ||
				transactions[i].paidBy == username && transactions[i].paidTo == sessionUser.username){

				if(transactions[i].isFriends == true)
					relTransactions.push(transactions[i]);
			}	
		}
		async.forEach(relTransactions, function(item, cb){
			Bill.findById(item.bill, (err, bill) => {
				dates.push(bill.dateCreated);
				cb();
			});
		}, function(err){
			User.findOne({"username": sessionUser.username}, (err, user) => {
				for(let i = 0; i < user.friends.length; i++){
					if(user.friends[i].user == username){
						response.balance = user.friends[i].balance;
					}
				}
				User.findOne({"username": username}, (err, otherUser) => {
					for(let i = 0; i < otherUser.friends.length; i++){
						if(otherUser.friends[i].user == sessionUser.username){
							response.balance -= otherUser.friends[i].balance;
						}
					}
					response.transactions = relTransactions;
					response.dates = dates;
					res.json(response);
				});

			});
		});
	});
});

router.post('/remove-transaction/:id', (req, res) => {
	const id = req.params.id;
	Transaction.findById(id, (err, transaction) => {
		const user = transaction.paidBy;
		User.findOne({"username": user}, (err, foundUser) => {
			for(let i = 0;i < foundUser.friends.length; i++){
				if(foundUser.friends[i].user == transaction.paidTo){
					const newBalance = foundUser.friends[i].balance += transaction.amount;
					User.updateOne({'friends._id': foundUser.friends[i]._id}, {'$set': {
							'friends.$.balance': newBalance
						}}, function(){
							Transaction.deleteOne({_id: id}, (err) => {
								if(err){
									res.json(err);
								}
								else
									res.send("document removed");
							});
					});
				}
			}
		});
	});
});

router.post('/change-tip', (req, res) => {
	const newTip = req.body.tip;
	if(!Number.isNaN(parseInt(newTip))){
		const user = req.session.user.username;
		User.findOne({"username": user}, (err, foundUser) => {
			foundUser.defaultTip = parseInt(newTip);
			foundUser.save();
			res.redirect('/user/index');
		});
	}
	else{
		res.redirect('/user/'+req.session.user.username + "?error=error");
	}
});

router.get('/search', (req, res)=>{
	const value = req.query.value;

	User.find({$and:[ {"username": new RegExp(`^${value}`, 'i')}, {"username": {$ne: req.session.user.username}} ]}, (err, docs)=>{

		if(!err){
			res.send(docs);
		}
	});
	

});

module.exports = router;
