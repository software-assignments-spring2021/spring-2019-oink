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

router.post('/add-friend',(req,res)=>{
	const username = req.body.username; //username of the friend being added
	api.addFriend(username, req.session.user, function(bool){
		if(bool)
			res.send({result: "added"});
		else
			res.send({result: "error"});
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
				res.redirect('/user/' + req.session.user.username);
			});
	    });		

	});
});

router.post('/image', (req, res) => {
	const username = req.body.username;
	api.getImage(username, function(response){
		res.send(response);
	});
});

router.post('/history', (req, res) => {
	const username = req.body.username;
	const sessionUser = req.session.user;
	api.getHistory(username, sessionUser, function(response){
		if(response != undefined)
			res.json(response);
		else
			res.send('error');
	});
});

router.post('/remove-transaction/:id', (req, res) => {
	const id = req.params.id;
	api.removeTransaction(id, function(response){
		if(response == 'document removed')
			res.send('document removed');
		else
			res.send('error');
	});
});

router.post('/change-tip', (req, res) => {
	const newTip = req.body.tip;
	api.changeTip(newTip, req.session.user.username, function(response){
		res.send(response);
	});
});

module.exports = router;