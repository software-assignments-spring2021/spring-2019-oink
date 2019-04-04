const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); 
require('../schemas'); 

const User = mongoose.model("User");
const Bill = mongoose.model("Bill");
const Transaction = mongoose.model("Transaction");


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
		res.redirect(`/user/${req.session.user.username}`)
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
						//res.redirect(`/user/${user.username}`);
						res.redirect('/user/'+req.session.user.username); // Until User web pages created
					}
				});
			});
		}
	});
});

router.get('/login', (req, res) => {
	//if the user is already logged in, redirect to the home page
	if(req.session.user){
		res.redirect(`/user/${req.session.user.username}`)
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
					//res.redirect(`/user/${user.username}`); // REDIRECT TO HOME PAGE
					res.redirect('/user/'+req.session.user.username); // Until User web pages created
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

router.get('/transactions', (req, res) => {
	if(req.session.user){
		const transactionIDs = req.session.user.transactions;
		const transactions = [];

		let searchUser = "";
		if(req.query.searchUser !== undefined)
			searchUser = req.query.searchUser;
		
		for(let i = 0 ; i < transactionIDs.length; i++){
			const id = transactionIDs[i];
			Transaction.findById(id, (err, transaction)=>{
				if(!err){
					if(transaction.paidTo == searchUser || searchUser == ""){
						if(transaction.isPaid == false) // only display current, non-paid transactions
							transactions.push(transaction);
					}
				}
				else{
					res.send('error');
				}
			});
		}
		res.render("transactions", {"user": req.session.user.username, "transactions": transactions});
	}
	else{
		res.redirect('login');
	}
});

router.get("/my-bills", (req, res)=>{
	//view all bills added by the user
	

	if(req.session.user){

		const bills = req.session.user.bills;

		//in this format so that we can also sort by date
		Bill.find({"_id":{$in:bills}}).exec((err, docs)=>{
			console.log(docs);
			res.render("allUserBills", {"bills":docs});

		});
	}
	else{
		res.redirect('/user/login');
	}
});


//view a user
router.get('/:username', (req, res) => {
	if(req.session.user){
		const username = req.params.username;
		//if it's the session user, there's no need to go to the database again
		if(username === req.session.user.username){
			res.render('user', {"username": username});
		}
		else{
			res.send("Error: User not found");
		}
	}
	else{
		res.redirect('login');
	}

});

module.exports = router;