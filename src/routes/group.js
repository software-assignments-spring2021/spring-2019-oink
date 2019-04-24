const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Group = mongoose.model("Group");


router.get('/add',(req,res)=>{
	if(req.session.user){

		User.find({"username": { $ne: req.session.user.username}}, (err, users) => {
			if(req.query.error == undefined)
				res.render('add-group', {'friends': users, 'user': req.session.user.username});
			else{
				let error = "Error Processing Group";
				if(req.query.error == "error2")
					error = "Group Name Taken";
				else if(req.query.error == "error3")
					error = "At Least 2 Members Needed";
				res.render('add-group', {'friends': users, 'user': req.session.user.username, 'error': error});	
			}
		});
	}
	else{
		res.redirect('/user/login');
	}
});

router.post('/add', (req, res) => {
	let user = req.session.user;
	if(user){
		if(req.body.name != ""){
			Group.findOne({name: req.body.name}, (err, group) => {
				if(!group){
					let groupMembers = req.body.splitWith.split(','); 
					groupMembers[groupMembers.length-1] = user.username;
					if(groupMembers.length <= 1)
						res.redirect('add?error=error3');
					else{
						const defaultPercentage = Math.floor(100 / groupMembers.length); //default even split
						const defaultPercentages = new Array(groupMembers.length).fill(defaultPercentage);

						// make sure percentages add up to 100
						let sum = 0;
						for(let i = 0;i < defaultPercentages.length; i++){
							sum += defaultPercentages[i];
						}

						defaultPercentages[defaultPercentages.length-1] += (100 - sum);

						const group = new Group({
							name: req.body.name,
							inGroup: groupMembers,
							defaultPercentages: defaultPercentages,
							administrator: req.session.user.username
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
				}
				else{
					res.redirect('add?error=error2');
				}
			});
		}
		else{
			res.redirect('add?error=error');
		}
	}
	else{
		res.redirect('/user/login');
	}
});

router.post('/delete/:id', (req, res) => {

	if(req.session.user){
		const id = req.params.id;

		Group.deleteOne({_id: id}, (err) => {
			if(err)
				res.json(err);
			else{
				res.send("group removed");
			}
		});

	}else{
		res.redirect('/user/login');
	}
});

router.post('/remove-member', (req, res) => {
	if (req.session.user){

		const username = req.body.member;
		const groupID = req.body.group;
		Group.findOne({_id: groupID}, (err, group) => {
			const index = group.inGroup.indexOf(username);
			group.inGroup.splice(index, 1);
			group.save(function(){
				User.findOne({username: username}, (error, user) => {
					const i = user.groups.indexOf(group._id);
					user.groups.splice(i, 1);
					user.save();
					res.send("member removed");
				});
			});
		});
	}else{
		res.redirect('/user/login');
	}
});

router.post('/add-member', (req, res) => {
	if(req.session.user){

		const username = req.body.member;
		const groupID = req.body.group;
		Group.findOne({_id: groupID}, (err, group) => {
			group.inGroup.push(username);
			group.save(function(){
				User.findOne({username: username}, (error, user) => {
					user.groups.push(groupID);
					user.save();
					res.send("member added");
				});
			});
		});
	}else{
		res.redirect('/user/login');
	}
});

router.get('/:id', (req, res) => {

	if(req.session.user){


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
	}else{
		res.redirect('/user/login');
	}
});


module.exports = router;