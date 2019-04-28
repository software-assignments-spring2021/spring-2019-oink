const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Group = mongoose.model("Group");

// Displays add group page, accessible from sidebar.
// Includes a form for user to choose group name and members.
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

// Handles form submission from add-group page. Ensures more than 1 member,
// correct group name (exists and unique). Sets default group percentages as
// an equal split depending on the number of members in the group.

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
						console.log(groupMembers);
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
							res.redirect(addedGroup._id + "?admin=true");
						});
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

// Deletes group from groups collection and from all relevant user's
// groups field - cannot be taken back.
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

// Accessible only to admin member of group. Will remove member of
// group in group schema as well as reference to group in the selected
// user's schema.
router.post('/remove-member', (req, res) => {
	if (req.session.user){

		const username = req.body.member;
		const groupID = req.body.group;
		console.log(username);
		console.log(groupID);
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

// Reverse of remove-member. Adds a member to inGroup field of relevant group.
// Adds reference to this group's ID in user's groups field.
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

// Returns requested group's information for
// AJAX requests.
router.get('/get/:id', (req, res) => {

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

// Takes as parameter an object ID of a group that, if correct,
// will display a unique group's profile page. Depending on the session user,
// the query string isAdmin will be true or false, changing the contents of the page.
// For an admin, "edit" and "delete" buttons appear. For everyone else, a "leave group"
// option appears.
router.get('/:id', (req, res) => {
	if(req.session.user){
		const id = req.params.id;
		Group.findById(id, (error, group) => {
			if(group){
				const isAdmin = req.query.admin;
				if(isAdmin == "true"){
					if(group.administrator == req.session.user.username) // Make sure session user is actually the admin
						res.render('group-profile-admin', {group: group}); // In case path specified directly
					else
						res.redirect('id?isAdmin=false'); // If not redirect to isAdmin=false page
				}
				else{ // By default, render isAdmin=false page
					if(group.inGroup.length > 0)
						res.render('group-profile-normal', {group: group, user: req.session.user.username});
					else
						res.render('group-profile-normal', {group: group, noMembers: true});
				}
			}
			else{
				res.redirect('/user/index');
			}
		});
	}
	else{
		res.redirect('/user/login');
	}
});


module.exports = router;