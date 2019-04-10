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

module.exports = router;