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

router.get('/register', (req, res) => {
	res.render('registration');
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
						res.redirect(`/user/${user.username}`);
					}
				});
			});
		}
	});
});

router.get('/login', (req, res) => {
	res.render('Login');
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
					res.redirect(`/user/${user.username}`); // REDIRECT TO HOME PAGE
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

router.get('/:username', (req, res) => {
	const username = req.params.username;
	//if it's the session user, there's no need to go to the database again
	if(username === req.session.user.username){
		res.send(`profile for session user ${username}`);
	}
	else{
		User.findOne({'username': username}, function(err, user, count){
			if(user != null){
				res.send(`profile page for ${username}`);
			}
			else{
				res.send('404 Error');
			}
		});
	}
});

module.exports = router;