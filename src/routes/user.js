const express = require('express');
const mongoose = require('mongoose');
const async = require('async');
const router = express.Router(); 
require('../schemas'); 

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
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
	user = {username: req.body.username, email: req.body.email};

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
			if(transaction !== null){
				transaction.isPaid = true;
				transaction.save();
				console.log("Transaction paid");
				res.send("ok");
			}
		}
		else{
			console.log(err);
			res.send("error");
		}
	});
});

router.get('/index', (req, res) => {
	if(req.session.user){
		User.find({}, function(err, users, count){
			User.findOne({"username": req.session.user.username}, function(err, user){
				
				const transactionIDs = user.transactions;
				let found = false;
				let notification;
				
				/*
				for(let i = transactionIDs.length-1; i >= 0; i--){
					Transaction.findById(transactionIDs[i], (err, transaction) => {
						if(!transaction.isPaid && !found){
							notification = transaction;
							found = true;
						}
					});
				}*/
				async.forEach(transactionIDs, function(item, callback){
					Transaction.findById(item, (err, transaction) => {
						if(!transaction.isPaid && !found){
							notification = transaction;
							found = true;
						}
						callback();
					});
				}, function(err){
					const groups = [];
					for(let i = 0; i < req.session.user.groups.length; i++){
						Group.findById(req.session.user.groups[i], (err, group) => {
							groups.push(group);
						});
					}
					if(notification !== undefined)
						res.render('user', {"friends": users, "groups": groups, "notification": notification});
					else
						res.render('user', {"friends": users, "groups": groups});
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

		const bills = req.session.user.bills;

		//in this format so that we can also sort by date
		Bill.find({"_id":{$in:bills}}).exec((err, docs)=>{
			//console.log(docs);
			res.render("allUserBills", {"bills":docs});

		});
	}
	else{
		res.redirect('/user/login');
	}
});


//view a user
router.get('/:username', (req, res) => {

	const user = req.params.username;
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
			res.render('user-profile', {"user": user, "groups": groups});
		}
	});

});

module.exports = router;