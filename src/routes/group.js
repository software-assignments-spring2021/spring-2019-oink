const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Group = mongoose.model("Group");


router.get('/add',(req,res)=>{
	User.find({"username": { $ne: req.session.user.username}}, (err, users) => {
		const user = req.session.user;
		if(user){
			res.render('add-group', {'friends': users, 'user': user.username});
		}
		else{
			res.redirect('/user/login');
		}
	});
});

router.post('/add', (req, res) => {
	let user = req.session.user;
	if(user){
		let groupMembers = req.body.splitWith.split(','); 
		groupMembers[groupMembers.length-1] = user.username;
		const group = new Group({
			name: req.body.name,
			inGroup: groupMembers
		});
		group.save((err, addedGroup) => {
			if (err){
				console.log(err);
				res.send("Error adding Group");
			}
			else{
				for(let i = 0; i < groupMembers.length; i++){
					User.findOne({"username": groupMembers[i]}, (err, user) => {
						user.groups.push(addedGroup._id);
						user.save();
					});
				}
			}
		});
		res.redirect('/user/' + user.username);
	}
	else{
		res.redirect('/user/login');
	}
});

router.get('/:id', (req, res) => {
	const id = req.params.id;
	Group.findById(id, (err, group) => {
		if(group){
			res.json(group);
		}
		else{
			res.send(err);
			console.log(err);
		}
	});
});

module.exports = router;