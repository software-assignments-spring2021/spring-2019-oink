const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); 
require('../schemas'); 

const User = mongoose.model("User");

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

router.use(passport.initialize());
router.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/register', (req, res, next) => {
	res.send('Register Page');
  	//next();
});

router.post('/register', (req, res) => {
	user = {username: req.body.username, email: req.body.email};
	User.register(new User(user), req.body.password, function(err, user){
		if(err){
			//res.render('register', {message: 'ERROR IN CREATING ACCOUNT'});
			// If error, reload page with error message
		}
		else{
			passport.authenticate('local')(req, res, function() {
				req.session.regenerate((err) => {
					if(!err){
						req.session.user = user;
						res.redirect('/:username');
					}
				});
			});
		}
	});
});

router.get('/login', (req, res, next) => {
	res.send('Login');
  	//next();
});

router.post('/login', (req, res, next) => {
  	passport.authenticate('local', function(err, user){
		if(!user){
			//res.render('login', {message: "Error processing Login request"});
			// RELOAD PAGE WITH ERROR MESSAGE
		}
		else{
			req.session.regenerate((err) => { // OTHERWISE, BEGIN SESSION WITH USER
				if(!err){
					req.session.user = user;
					res.redirect('/:username'); // REDIRECT TO HOME PAGE
				}
			});
		}
	})(req, res, next);
});

router.get('/logout', (req, res, next) => {
  	res.send('');
  	//next();
});

router.get('/:username', (req, res, next) => {
	const username = req.params.username;
	User.findOne({'username': username}, function(err, user, count){
		if(user != null){
			res.send(`profile page for ${username}`);
		}
		else{
			res.send('404 Error');
		}
		//next();	
	});
});

module.exports = router;