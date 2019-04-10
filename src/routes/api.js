const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Friend = mongoose.model("Friend");


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
					/*
					user.save((err, savedUser) => {
						console.log(req.session.user);
						newFriend.save((err, savedFriend) => {
							secondFriend.save((err, savedSecondFriend) => {
								res.send({result: "added"});
							});
						});
					});*/
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

module.exports = router;