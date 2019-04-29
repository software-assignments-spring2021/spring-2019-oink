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

const usr = require('../public/js/server-side/user_helpers');

const Group = mongoose.model("Group");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const IP = require('../public/js/iteratorPattern');

router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Registration page to create an account accessible from
// Landing page.
router.get('/register', (req, res) => {
	//if the user is already logged in, redirect to the home page

	if(usr.inSession(req.session.user)){
		res.redirect('/user/index');
	}
	else{
		res.render('registration');
	}
});

// Creates new account with user input for username, email, and password.
// All sensitive information hashed with PassportJS. Default profile picture
// set.
router.post('/register', (req, res) => {
	const img = {};
	img.src = '/images/no_profile_picture.png';
	img.contentType = '/image/png';
	img.rawSRC = __dirname + '/../public/images/no_profile_picture.png';
	user = {username: req.body.username, email: req.body.email, 'img': img, 'defaultTip': 20};

	if(user.email != ""){
		User.register(new User(user), req.body.password, function(err, user){
			if(err){
				console.log(err);
				res.render('registration', {error: err.message});
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
	}
	else{
		res.render('registration', {error: "No Email Provided"});
	}
});


// Login page accessible from landing page or registration page.
router.get('/login', (req, res) => {
	//if the user is already logged in, redirect to the home page
	if(req.session.user){
		res.redirect('/user/index');
	}
	else{
		res.render('Login');
	}
});

// Uses PassportJS to verify inputted passport with hashed/salted password
// stored in the database. If incorrect, rerenders with error message.
// Otherwise, takes User to Add-Bill page. 
router.post('/login', (req, res) => {

  	passport.authenticate('local', function(err, user){
		if(!user){
			res.render('Login', {error: "Error in username or password"});
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

// Ends current session of user. Redirects to landing Page.
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

// Renders all transactions of a user (both paid and unpaid) with option
// to "pay" and update balances with another user if friends.
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

// Will mark transaction as paid in db and update balance
// between two users if friends.
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

// Add bill page for user, only accessible with account. Notification displays if any unpaid transactions
// for a session user. 
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
							if(group)
								groups.push(group);
						});
					}
					if(req.query.error == undefined){
						if(notification !== undefined)
							res.render('user', {"user": user, "friends": users, "groups": groups, "notification": notification});
						else
							res.render('user', {"user": user, "friends": users, "groups": groups});
					}
					else{
						let error = "Error Processing Bill";
						if(req.query.error == "error1")
							error = "Incorrect Number of Users";
						else if(req.query.error == "error2")
							error = "Bill Portions do not add up to total";

						if(notification !== undefined)
							res.render('user', {"user": user, "friends": users, "groups": groups, "notification": notification, 'error': error});
						else
							res.render('user', {"user": user, "friends": users, "groups": groups, 'error': error});

					}
				});					
			});
		});
	}
	else{
		res.redirect('/user/login');
	}
});

// Displays all bills user has created themself. 
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

// Displays user's list of friends. When clicked, each will display
// a list of transactions and a total balance between those two users
// since the start of their friendship.
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

// Returns all users in a database besides the requested ones
router.post('/members', (req, res) => {
	const usernames = req.body.usernames.split(',');
	User.find({username: {$nin: usernames}}, (err, users) => {
		res.json(users);
	});
});

// view a user's profile page. Displays all their transactions, bills,
// groups. Default tip can be set and new profile picture can be set
// if session user's profile. If other user's profile, only displays
// static information.
router.get('/:username', (req, res) => {


	if(req.session.user){


		const user = req.params.username;
		const sessionUser = req.session.user;

		User.findOne({"username": user}, (err, foundUser) => {
			if(!foundUser){
				res.redirect('/user/index');
			}

			else{
				//get all groups
				const groups = [];
				const adminGroups = [];
				const allGroups = [];
				Group.find({"_id":{$in:foundUser.groups}}).exec((err, docs)=>{
					if(docs){
						
						docs.forEach((doc)=>{
							allGroups.push(doc);

							if (doc.administrator === sessionUser.username){
								adminGroups.push(doc);
							}
							else{
								groups.push(doc);
							}
						});
					}

				});
				//get all bills
				const allBills = []
				Bill.find({"_id":{$in:foundUser.bills}}).exec((err, docs)=>{
					//console.log(docs);
					docs.forEach((doc)=>{allBills.push(doc)});

				});

				//get all transactions
				const paid = []
				const unpaid = []

				Transaction.find({"_id":{$in:foundUser.transactions}}).exec((err, docs)=>{
					docs.forEach((doc)=>{
						//console.log(doc);
						if (doc.isPaid){
							paid.push(doc);
						}
						else{
							unpaid.push(doc);
						}
					});

				});

				if(user === sessionUser.username){

					if(req.query.error == undefined){
						res.render("session-user-profile", {
							"user": foundUser.username, 
							"bills": allBills,
							"paid":paid,
							"unpaid":unpaid,
							"adminGroups":adminGroups, 
							"groups":groups, 
							"friends": foundUser.friends, 
							"image": foundUser.img, 
							"tip":foundUser.defaultTip
						});
					}
					else{
						res.render("session-user-profile", {
							"user": foundUser.username, 
							"bills": allBills,
							"paid":paid,
							"unpaid":unpaid,
							"adminGroups":adminGroups, 
							"groups":groups, 
							"friends": foundUser.friends, 
							"image": foundUser.img, 
							"tip":foundUser.defaultTip,
							error: "Number Needed for Tip"
						});
					}
				}

				else{
					let friend = false;


					for(let i = 0; i < sessionUser.friends.length; i++){
						if(sessionUser.friends[i].user == user)
							friend = true;
					}
					res.render('user-profile', {
						"user": user, 
						"bills":allBills,
						"groups": allGroups, 
						"friends": foundUser.friends, 
						"addFriend": friend,  
						"image": foundUser.img
					});
				}
			}
		});
	}
	else{
		res.redirect('/user/login');
	}

});

module.exports = router;