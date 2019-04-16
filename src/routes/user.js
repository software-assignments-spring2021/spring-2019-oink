const express = require('express');
const mongoose = require('mongoose');
const async = require('async');
const router = express.Router(); 
const fs = require('fs');
require('../schemas'); 

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const Transaction = mongoose.model("Transaction");

const Group = mongoose.model("Group");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/register', (req, res) => {
	//if the user is already logged in, redirect to the home page

	if(req.session.user){
		res.redirect('/user/index');
	}
	else{
		res.render('registration');
	}
});

router.post('/register', (req, res) => {
	const img = {};
	img.src = '/images/no_profile_picture.png';
	img.contentType = '/image/png';
	img.rawSRC = __dirname + '/../public/images/no_profile_picture.png';
	user = {username: req.body.username, email: req.body.email, 'img': img, 'defaultTip': 20};

	User.register(new User(user), req.body.password, function(err, user){
		if(err){
			res.send(err)
			//res.render('register', {errMessage: 'ERROR IN CREATING ACCOUNT'});
			// If error, reload page with error message
		}
		else{
			passport.authenticate('local')(req, res, function() {
				req.session.regenerate((err) => {
					if(!err){
						req.session.user = user;
						res.redirect('/user/index'); // Until User web pages created
					}
				});
			});
		}
	});
});

router.get('/login', (req, res) => {
	//if the user is already logged in, redirect to the home page
	if(req.session.user){
		res.redirect('/user/index');
	}
	else{
		res.render('Login');
	}
});

router.post('/login', (req, res) => {

  	passport.authenticate('local', function(err, user){
		if(!user){
			res.send("no user found");
			//res.render('login', {errMessage: "Error processing Login request"});
			// RELOAD PAGE WITH ERROR MESSAGE
		}
		else{
			req.session.regenerate((err) => { // OTHERWISE, BEGIN SESSION WITH USER
				if(!err){
					req.session.user = user;
					res.redirect('/user/index'); // Until User web pages created
				}
			});
		}
	})(req, res);
});


router.get('/logout', (req, res) => {

  	req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('/');
		}
	});
});

router.get('/my-transactions', (req, res) => {
	const user = req.session.user;
	if(user){
		Transaction.find({"paidBy": user.username}, (err, transactions) => {
			const unpaid = [];
			const paid = [];
			for (let i = 0 ; i < transactions.length; i++){
				if(transactions[i].isPaid === true)
					paid.push(transactions[i]);
				else
					unpaid.unshift(transactions[i]);
			}
			res.render('my-transactions', {"paid": paid, "unpaid": unpaid});
		});
	}
	else{
		res.redirect('/user/login');
	}
});

router.post('/pay-transaction/:id', (req, res) => {
	const id = req.params.id;
	Transaction.findById(id, (err, transaction) => {
		if(transaction){
			transaction.isPaid = true;
			transaction.save();
			console.log("Transaction paid");

			// UPDATE BALANCES
			User.findOne({"username": transaction.paidBy}, (error, user) => {
				for(let i = 0; i < user.friends.length; i++){
					if(user.friends[i].user === transaction.paidTo){
						user.friends[i].balance += transaction.amount;
						user.markModified('friends');
						user.save();
					}
				}
			});
			res.send("ok");
			
		}
		else{
			console.log(err);
			res.send("error");
		}
	});
});

router.get('/index', (req, res) => {
	if(req.session.user){
		User.find({"username": { $ne: req.session.user.username}}, function(err, users, count){
			User.findOne({"username": req.session.user.username}, function(err, user){
				
				const transactionIDs = user.transactions;
				let found = false;
				let notification;
				
				async.forEach(transactionIDs, function(item, callback){
					Transaction.findById(item, (err, transaction) => {
						if(transaction){
							if(!transaction.isPaid && !found){
								notification = transaction;
								found = true;
							}
						}
						callback();
					});
				}, function(err){
					const groups = [];
					for(let i = 0; i < user.groups.length; i++){
						Group.findById(user.groups[i], (err, group) => {
							groups.push(group);
						});
					}
					if(notification !== undefined)
						res.render('user', {"user": user, "friends": users, "groups": groups, "notification": notification});
					else
						res.render('user', {"user": user, "friends": users, "groups": groups});
					});	
					
			});
		});
	}
	else{
		res.redirect('/user/login');
	}
});


router.get("/my-bills", (req, res)=>{
	//view all bills added by the user
	

	if(req.session.user){
		User.findOne({"username": req.session.user.username}, (err, user) => {
			const bills = user.bills;

			//in this format so that we can also sort by date
			Bill.find({"_id":{$in:bills}}).exec((err, docs)=>{
				//console.log(docs);
				res.render("allUserBills", {"bills":docs});

			});
		});
		
	}
	else{
		res.redirect('/user/login');
	}
});

router.get('/search', (req, res) => {
	const user = req.session.user;
	if(user){
		User.find({"username": { $ne: req.session.user.username}}, (err, users) => {
			res.render('add-friend', {"friends": users});
		});
	}
	else{
		res.redirect('/user/login');
	}
});


router.get('/my-balances', (req, res) => {
	const user = req.session.user;
	if(user){
		User.findOne({"username": user.username}, (err, sessionUser) => {
			res.render('my-balances', {friends: sessionUser.friends});
		});
	}
	else{
		res.redirect('login');
	}
});

//view a user
router.get('/:username', (req, res) => {

	if(req.session.user){
		const user = req.params.username;
		const sessionUser = req.session.user;
		User.findOne({"username": user}, (err, foundUser) => {
			if(!foundUser){
				res.redirect('/user/index');
			}

			else{
				const groups = [];
				for(let i = 0; i < foundUser.groups.length; i++){
					Group.findById(foundUser.groups[i], (err, group) => {
						groups.push(group);
					});
				}
				const friendsList = foundUser.friends;
				console.log(friendsList);
				if(user === sessionUser.username){
					User.findOne({"username": sessionUser.username}, (err, foundUser) => {
						res.render('user-profile', {"user": user, "groups": groups, "friends": friendsList, "image": foundUser.img, "tip": foundUser.defaultTip});
					});
				}

				else{
					let friend = false;
					User.findOne({"username": sessionUser.username}, (err, tempUser) => {
						for(let i = 0; i < tempUser.friends.length; i++){
							if(tempUser.friends[i].user == user)
								friend = true;
						}
						if(friend)
							res.render('user-profile', {"user": user, "groups": groups, "friends": friendsList, "image": tempUser.img});
						else
							res.render('user-profile', {"user": user, "groups": groups, "friends": friendsList, "addFriend": "Add Friend"
								, "image": tempUser.img});
						});
				}
			}
		});
	}
	else{
		res.redirect('login');
	}

});

module.exports = router;