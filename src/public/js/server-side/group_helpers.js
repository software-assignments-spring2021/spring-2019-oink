const mongoose = require('mongoose');
const User = mongoose.model("User");
const Group = mongoose.model("Group");
const async = require('async');

function handleGroupError(user, query, cb){
	User.findOne({username: user.username}, (err, searchUser) => {
		if(searchUser){
			User.find({"username": { $ne: user.username}}, (er, users) => {
				if(users){
					if(query.error == undefined){
						//res.render('add-group', {'friends': users, 'user': req.session.user.username});
						return cb({'friends': users, 'user': user.username});
					}
					else{
						let error = "Error Processing Group";
						if(query.error == "error2")
							error = "Already In A Group of Same Name";
						else if(query.error == "error3")
							error = "At Least 2 Members Needed";
						//res.render('add-group', {'friends': users, 'user': req.session.user.username, 'error': error});	
						return cb({'friends': users, 'user': user.username, 'error': error});
					}
				}
				else
					return cb('error');
			});
		}
		else
			return cb('error');
	});
}

function addGroup(user, request, cb){
	if(request.body.name != ""){
		Group.findOne({name: request.body.name}, (err, group) => {
			let inGroup = false;
			if(group){
				for(let i = 0; i < group.inGroup.length; i++){
					if(group.inGroup[i] == user.username)
						inGroup = true;
				}
			}
			if(!inGroup){
				let groupMembers = request.body.splitWith.split(','); 
				groupMembers[groupMembers.length-1] = user.username;
				if(groupMembers.length <= 1){
					//res.redirect('add?error=error3');
					return cb('add?error=error3');
				}
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
						name: request.body.name,
						inGroup: groupMembers,
						defaultPercentages: defaultPercentages,
						administrator: user.username
					});
					group.save((err, addedGroup) => {
						if (err){
							console.log(err);
							//res.send("Error adding Group");
							return cb("Error adding Group");
						}
						else{
							for(let i = 0; i < groupMembers.length; i++){
								User.findOne({"username": groupMembers[i]}, (err, user) => {
									user.groups.push(addedGroup._id);
									user.save();
								});
							}
						}
						//res.redirect(addedGroup._id + "?admin=true");
						return cb(addedGroup._id + "?admin=true");
					});
				}
			}
			else{
				//res.redirect('add?error=error2');
				return cb('add?error=error2');
			}
		});
	}
	else{
		//res.redirect('add?error=error');
		return cb('add?error=error');
	}
}

function deleteGroup(id, cb){

	Group.deleteOne({_id: id}, (err) => {
		if(err){
			//res.json(err);
			return cb('error');
		}
		else{
			//res.send("group removed");
			return cb('group removed');
		}
	});
}

function removeMember(req, cb){
	const username = req.body.member;
	const groupID = req.body.group;
	Group.findOne({_id: groupID}, (err, group) => {
		if(group){
			const index = group.inGroup.indexOf(username);
			group.inGroup.splice(index, 1);
			group.save(function(){
				User.findOne({username: username}, (error, user) => {
					if(user){
						const i = user.groups.indexOf(group._id);
						user.groups.splice(i, 1);
						user.save();
						//res.send("member removed");
						return cb('member removed');
					}
					else
						return cb('error');
				});
			});
		}
		else
			return cb('error');
	});
}

function addMember(req, cb){
	const username = req.body.member;
	const groupID = req.body.group;
	Group.findOne({_id: groupID}, (err, group) => {
		if(group){
			group.inGroup.push(username);
			group.save(function(){
				User.findOne({username: username}, (error, user) => {
					if(user){
						user.groups.push(groupID);
						user.save();
						//res.send("member added");
						return cb('member added');
					}
					else
						return cb('error');
				});
			});
		}
		else
			return cb('error');
	});
}

function getGroup(id, cb){
	Group.findById(id, (err, group) => {
		if(group){
			//res.json(group);			

			return cb(group);
		}
		else{
			//res.send(err);
			console.log(err);
			return cb('error');
		}
	});
}

function groupProfile(id, user, isAdmin, cb){
	let groupInfo = {inGroup:[]}
	Group.findById(id, (error, group) => {
		if(group){
			groupInfo["name"] = group.name;

			User.find({"username": {$in: group.inGroup}}, (err, users)=>{


				for (let i = 0; i < users.length; i++){
					groupInfo.inGroup.push({"name": users[i].username, "profilePic":users[i].img.src});
				}




				if(isAdmin){
					if(group.administrator == user.username){ // Make sure session user is actually the admin
						//res.render('group-profile-admin', {group: group}); // In case path specified directly
						console.log(groupInfo);
						return cb({group: groupInfo});
					}
					else{
						//res.redirect('id?isAdmin=false'); // If not redirect to isAdmin=false page
						return cb('id?isAdmin=false');
					}
				}
				else{ // By default, render isAdmin=false page
					if(group.inGroup.length > 0){
						//res.render('group-profile-normal', {group: group, user: req.session.user.username});
						return cb({group: groupInfo, user: user.username});
					}
					else{
						//res.render('group-profile-normal', {group: group, noMembers: true});
						return cb({group: groupInfo, noMembers: true});
					}
				}

			});


			
		}
		else{
			//res.redirect('/user/index');
			return cb('/user/index');
		}
	});
}

module.exports = {
	handleGroupError: handleGroupError,
	addGroup: addGroup,
	deleteGroup: deleteGroup,
	removeMember: removeMember,
	addMember: addMember,
	getGroup: getGroup,
	groupProfile: groupProfile
}