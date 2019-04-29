const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Group = mongoose.model("Group");
const gr = require('../public/js/server-side/group_helpers');

// Displays add group page, accessible from sidebar.
// Includes a form for user to choose group name and members.
router.get('/add',(req,res)=>{
	if(req.session.user){
		gr.handleGroupError(req.session.user, req.query, function(ret){
			if(ret == 'error')
				res.send('error');
			else{
				res.render('add-group', ret);
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
		gr.addGroup(user, req, function(ret){
			if(ret == 'Error adding Group')
				res.send(ret);
			else
				res.redirect(ret);
		});
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
		gr.deleteGroup(id, function(ret){
			res.send(ret);
		});
	}
	else{
		res.redirect('/user/login');
	}
});

// Accessible only to admin member of group. Will remove member of
// group in group schema as well as reference to group in the selected
// user's schema.

router.post('/remove-member', (req, res) => {
	if (req.session.user){
		gr.removeMember(req, function(ret){
			res.send(ret);
		});
	}else{
		res.redirect('/user/login');
	}
});

// Reverse of remove-member. Adds a member to inGroup field of relevant group.
// Adds reference to this group's ID in user's groups field.
router.post('/add-member', (req, res) => {
	if(req.session.user){
		gr.addMember(req, function(ret){
			res.send(ret);
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
		gr.getGroup(id, function(ret){
			if(ret == 'error')
				res.send(ret);
			else
				res.json(ret);
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
		let isAdmin = false;
		if(req.query.admin == 'true')
			isAdmin = true;
		gr.groupProfile(id, req.session.user, isAdmin, function(ret){
			if(typeof ret === 'string')
				res.redirect(ret);
			else{
				if(isAdmin)
					res.render('group-profile-admin', ret);
				else
					res.render('group-profile-normal', ret);
			}
		});
	}
	else{
		res.redirect('/user/login');
	}
});


module.exports = router;