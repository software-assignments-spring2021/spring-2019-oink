const express = require('express');
const mongoose = require('mongoose');
const async = require('async');
const router = express.Router(); 
const fs = require('fs');
require('../schemas'); 
const path = require('path')

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const Transaction = mongoose.model("Transaction");

const Group = mongoose.model("Group");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const IP = require('../public/js/iteratorPattern');
const usr = require('../public/js/server-side/user_helpers');



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
		res.render('signup');
	}
});

// Creates new account with user input for username, email, and password.
// All sensitive information hashed with PassportJS. Default profile picture
// set.
router.post('/register', (req, res) => {
	usr.addUser(req, function(ret){
		if(typeof ret == "string"){
			passport.authenticate('local')(req, null, function() {
				req.session.regenerate((err) => {
					if(!err){
						req.session.user = user;
						res.redirect(ret); // Until User web pages created
					}
				});
			});
		}
		else
			res.render('registration', ret);
	});
});


// Login page accessible from landing page or registration page.
router.get('/login', (req, res) => {
	//if the user is already logged in, redirect to the home page
	const ret = usr.getLogin(req.session.user);
	if(ret.charAt(0) == '/'){
		res.redirect(ret);
	}
	else{
		//res.sendFile(path.join(__dirname, "..", "public", "html", 'login.html'))
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
		usr.getTransactions(user, function(ret){
			res.render('my-transactions', ret);
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
	usr.payTransaction(id, function(ret){
		res.send(ret);
	});
});

// Add bill page for user, only accessible with account. Notification displays if any unpaid transactions
// for a session user. 
router.get('/index', (req, res) => {
	if(req.session.user){
		usr.getIndex(req.session.user, req, function(ret){
			res.render('user', ret);
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
		usr.myBills(req.session.user.username, function(ret){
			res.render('allUserBills', ret);
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
		usr.myBalances(user, function(ret){
			res.render('my-balances', ret);
		});
	}
	else{
		res.redirect('login');
	}
});

// Returns all users in a database besides the requested ones
router.post('/members', (req, res) => {
	const usernames = req.body.usernames.split(',');
	usr.getAllUsers(usernames, function(ret){
		res.json(ret);
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
		usr.getUserProfile(req, user, sessionUser, function(ret){
			if(typeof ret == 'string')
				res.redirect(ret);
			else if(user == sessionUser.username)
				res.render('session-user-profile', ret);
			else
				res.render('user-profile', ret);
		});
	}
	else{
		res.redirect('/user/login');
	}

});

module.exports = router;
