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

const api = require('../public/js/server-side/api_helpers');

// response of add-friend buttons on addBill page,
// creates two friend schemas: one for session user,
// one for requested user and adds one to each respective
// user's "friends" array field
router.post('/add-friend',(req,res)=>{
	const username = req.body.username; //username of the friend being added
	api.addFriend(username, req.session.user, function(bool){
		if(bool)
			res.send("added");
		else
			res.send("error");
	});
});

// Used to determine whether a given username is friends
// with the session user. Used for AJAX requests
// meant to determine if an "Add Friend" button is needed
// next to a given username

router.post('/is-friend', (req, res) => {
	const username = req.body.username;
	const user = req.session.user;
	api.isFriend(username, user, function(bool){
		if(bool)
			res.send("friends");
		else
			res.send("not_friends");
	});
});

// handles user input of type file. After upload complete, stores in
// images sub-directory of public. Stores two paths to this image in
// user object, one as absolute to root (rawSRC) and other as relative to 
// public directory (src)
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
	        //console.log('Uploaded ' + file.name);
	        sessionUser.img.rawSRC = __dirname + '/../public/images/' + file.name;
			sessionUser.img.src = '/images/' + file.name;
			sessionUser.save(() => {
				res.redirect('/user/' + req.session.user.username);
			});
	    });		

	});
});

// returns relative path of user's profile picture
// in project directory for display
router.post('/image', (req, res) => {
	const username = req.body.username;
	api.getImage(username, function(response){
		res.send(response);
	});
});

// returns the history between session user and requested user.
// only displays total balance/transactions since they have been
// established as friends in the database.
router.post('/history', (req, res) => {
	const username = req.body.username;
	const sessionUser = req.session.user;
	api.getHistory(username, sessionUser, function(response){
		//console.log(response);
		if(response != undefined)
			res.json(response);
		else
			res.send('error');
	});
});

// takes as parameter the object id of a transaction. If
// it exists, it is removed completely and its reference
// in the respective user's transactions field is removed
router.get('/remove-transaction/:id', (req, res) => {
	const id = req.params.id;
	api.removeTransaction(id, function(response){
		console.log(response);
		if(response == 'document removed'){
			res.send('removed');
		}else
			res.send('error');
	});
});

// takes as parameter a number (percentage) meant to be new default
// tip that will display automatically on add-bill page for session
// user.
router.post('/change-tip', (req, res) => {
	const newTip = req.body.tip;
	api.changeTip(newTip, req.session.user.username, function(response){
		console.log(response);
		if(response == 'Tip Changed')
			res.send(response);
		else{
			//res.redirect('/user/'+req.session.user.username + "?error=error");
			res.send(response);
		}
	});
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

