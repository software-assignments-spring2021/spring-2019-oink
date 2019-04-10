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

	
	User.findOne({"username": username},(err, doc)=>{
		doc.friends.push(secondFriend._id);
		doc.save((err,saved)=>{
			if(err){
				console.log(err);
				res.send({result: "error"});
			}
			else{
				//add the friend so it's immediatly accessible
				console.log(doc)
				//req.session.user.friends.push(newFriend);
				User.findOne({"username": req.session.user.username},(err, user)=>{
					user.friends.push(newFriend._id);
					user.save();
					console.log(req.session.user);
					newFriend.save();
					secondFriend.save();
					res.send({result: "added"});
				});
			}
		});
	});
});

router.get('/add-friend', (req, res) => {
	const user = req.session.user;
	if(user){
		User.find({}, (err, users) => {
			res.render('add-friend', {"friends": users});
		});
	}
	else{
		res.redirect('/user/login');
	}
});

module.exports = router;